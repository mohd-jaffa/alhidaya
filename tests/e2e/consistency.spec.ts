import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_PUBLIC_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { PAGE_KEYS } from "@/constants/sections";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { listRecordsForAdmin } from "@/lib/content/records";
import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { inspectLayout } from "@tests/support/layout-consistency";
import { PUBLIC_PERFORMANCE_ROUTES } from "@tests/support/performance-routes";

const RUN = crypto.randomUUID().slice(0, 8);
const PASSWORD = "a long consistency review password";
const SIZES = [
  [320, 740],
  [360, 800],
  [390, 844],
  [414, 896],
  [640, 900],
  [768, 1024],
  [844, 390],
  [1024, 900],
  [1440, 900],
] as const;
type Observation = Awaited<ReturnType<typeof inspectLayout>> & { path: string; width: number; height: number };

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `consistency-${RUN}-%`));
  await closeDb();
});
async function signIn(page: Page) {
  const email = `consistency-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Consistency reviewer", password: PASSWORD });
  expect(
    (
      await page.request.post(ADMIN_API_ROUTES.adminSession, {
        data: { email, password: PASSWORD },
        headers: { origin: E2E_ORIGIN },
      })
    ).ok(),
  ).toBe(true);
}
function failures(rows: Observation[]) {
  return rows.flatMap((row) => {
    const { path, width, height, overflow, smallTargets, smallInputs, clippedText, distortedLogos } = row;
    return overflow || smallTargets.length || smallInputs.length || clippedText.length || distortedLogos.length
      ? [{ path, width, height, overflow, smallTargets, smallInputs, clippedText, distortedLogos }]
      : [];
  });
}

test("public screens keep their content, actions and geometry across all responsive breakpoints", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one complete responsive matrix");
  test.setTimeout(600_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rows: Observation[] = [];
  const differences: { path: string; width: number; kind: string }[] = [];
  const axeIssues: { path: string; width: number; ids: string[] }[] = [];
  const headers = new Map<string, { height: number | null; background: string | null }>();
  for (const path of PUBLIC_PERFORMANCE_ROUTES) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first()).toBeVisible();
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await page.locator("footer .footer-logo img").evaluate((el) => (el as HTMLImageElement).decode());
    await page.getByRole("main").getByRole("heading", { level: 1 }).first().scrollIntoViewIfNeeded();
    const canonical = await inspectLayout(page);
    for (const [width, height] of SIZES) {
      await page.setViewportSize({ width, height });
      const result = await inspectLayout(page);
      rows.push({ path, width, height, ...result });
      const header = { height: result.headerHeight, background: result.headerBackground };
      const size = `${width}x${height}`;
      if (!headers.has(size)) headers.set(size, header);
      else if (JSON.stringify(header) !== JSON.stringify(headers.get(size)))
        differences.push({ path, width, kind: "navbar height/surface" });
      if (JSON.stringify(result.headings) !== JSON.stringify(canonical.headings))
        differences.push({ path, width, kind: "headings" });
      if (JSON.stringify(result.links) !== JSON.stringify(canonical.links))
        differences.push({ path, width, kind: "main links" });
      if (width === 320 || width === 768) {
        const violations = (await new AxeBuilder({ page }).analyze()).violations;
        if (violations.length) axeIssues.push({ path, width, ids: violations.map((item) => item.id) });
      }
      if (
        [320, 768, 1440].includes(width) &&
        new Set<string>([ROUTES.home, ROUTES.about, ROUTES.contact, ROUTES.services]).has(path)
      )
        await page.screenshot({ path: testInfo.outputPath(`${path.slice(1) || "home"}-${width}.png`), fullPage: true });
    }
  }
  await writeFile(
    testInfo.outputPath("public-layouts.json"),
    JSON.stringify({ rows, differences, axeIssues }, null, 2),
  );
  expect(failures(rows)).toEqual([]);
  expect(differences).toEqual([]);
  expect(axeIssues).toEqual([]);
});

test("contact tiles retain their requested colours and Reach us cards fit every supported font", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one contact font/size matrix");
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.home);
  const icons = page.locator(".home-quote .quote-contact-icon");
  await expect(icons).toHaveCount(3);
  await expect(icons.nth(0)).toHaveCSS("background-color", "rgb(37, 211, 102)");
  for (const index of [1, 2]) {
    await expect(icons.nth(index)).toHaveCSS("background-color", "rgb(11, 36, 64)");
    await expect(icons.nth(index)).toHaveCSS("color", "rgb(255, 255, 255)");
  }
  await page.goto(ROUTES.contact);
  await expect(page.locator(".contact-reach")).toHaveCSS("background-color", "rgb(15, 100, 172)");
  await expect(page.locator(".contact-message")).toHaveCSS("background-color", "rgb(15, 100, 172)");
  await expect(page.locator(".contact-message-panel")).toHaveCSS("background-color", "rgb(238, 245, 226)");
  const cards = page.locator(".contact-reach-card");
  await expect(cards).toHaveCount(3);
  const results: { width: number; font: string; fits: boolean }[] = [];
  for (const [width, height] of SIZES) {
    await page.setViewportSize({ width, height });
    for (const font of FONT_IDS) {
      await page.locator(".site-world").evaluate(
        async (el, { roles, stack, font }) => {
          for (const role of roles) (el as HTMLElement).style.setProperty(`--type-${role}`, stack);
          const variable = getComputedStyle(el).getPropertyValue(`--font-${font}`);
          await document.fonts.load(`600 21px ${variable}`);
          await document.fonts.load(`700 14px ${variable}`);
          await document.fonts.ready;
        },
        { roles: FONT_ROLES, stack: FONT_STACKS[font], font },
      );
      const fits = await cards.evaluateAll((elements) =>
        elements.every((el) => {
          const card = el.getBoundingClientRect();
          const link = el.querySelector("a")!.getBoundingClientRect();
          return (
            link.left >= card.left &&
            link.right <= card.right &&
            getComputedStyle(el).backgroundColor === "rgb(252, 253, 254)" &&
            getComputedStyle(el.querySelector("dt")!).fontWeight === "700"
          );
        }),
      );
      results.push({ width, font, fits });
    }
  }
  await writeFile(testInfo.outputPath("contact-card-fonts.json"), JSON.stringify(results, null, 2));
  expect(results.filter((row) => !row.fits)).toEqual([]);
});

test("Careers photo and heading fit every supported font across responsive sizes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one Careers font/size matrix");
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTES.careers);
  const rows: (Observation & { font: string })[] = [];
  for (const [width, height] of SIZES) {
    await page.setViewportSize({ width, height });
    for (const font of FONT_IDS) {
      await page.locator(".site-world").evaluate(
        async (el, { roles, stack, font }) => {
          for (const role of roles) (el as HTMLElement).style.setProperty(`--type-${role}`, stack);
          await document.fonts.load(`600 32px ${getComputedStyle(el).getPropertyValue(`--font-${font}`)}`);
          await document.fonts.ready;
        },
        { roles: FONT_ROLES, stack: FONT_STACKS[font], font },
      );
      rows.push({ path: ROUTES.careers, width, height, font, ...(await inspectLayout(page)) });
    }
  }
  await writeFile(testInfo.outputPath("careers-font-layouts.json"), JSON.stringify(rows, null, 2));
  expect(failures(rows)).toEqual([]);
});

test("Reach us cards lift on their first hover/focus and keep a static reduced-motion highlight", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(ROUTES.contact);
  const card = page.locator(".contact-reach-card").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
  await card.hover();
  await expect(card).toHaveCSS("translate", "0px -8px");
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("1");
  await page.mouse.move(0, 0);
  await card.getByRole("link").focus();
  await expect(card).toHaveCSS("translate", "0px -8px");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card).toHaveCSS("translate", "none");
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("1");
});

test("all admin lists, editors and auth screens fit narrow phones, tablets and laptops", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one complete admin responsive matrix");
  test.setTimeout(600_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const rows: Observation[] = [];
  for (const path of ADMIN_PUBLIC_ROUTES) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    for (const [width, height] of SIZES) {
      await page.setViewportSize({ width, height });
      rows.push({ path, width, height, ...(await inspectLayout(page)) });
    }
  }
  await signIn(page);
  const [services, jobs, clients] = await Promise.all([
    listRecordsForAdmin("SERVICES"),
    listRecordsForAdmin("JOBS"),
    listRecordsForAdmin("CLIENTS"),
  ]);
  const paths = [
    ADMIN_ROUTES.overview,
    ADMIN_ROUTES.enquiries,
    ADMIN_ROUTES.applications,
    ADMIN_ROUTES.pages,
    ...PAGE_KEYS.map(ADMIN_ROUTES.page),
    ADMIN_ROUTES.services,
    ADMIN_ROUTES.newService,
    ...services.filter((record) => record.publishedAt !== null).map((record) => ADMIN_ROUTES.service(record.id)),
    ADMIN_ROUTES.jobs,
    ADMIN_ROUTES.newJob,
    ADMIN_ROUTES.job(jobs.find((record) => record.publishedAt !== null)!.id),
    ADMIN_ROUTES.clients,
    ADMIN_ROUTES.newClient,
    ADMIN_ROUTES.client(clients.find((record) => record.publishedAt !== null)!.id),
    ADMIN_ROUTES.media,
    ADMIN_ROUTES.settings,
    ADMIN_ROUTES.fonts,
    ADMIN_ROUTES.operations,
    ADMIN_ROUTES.activity,
    ADMIN_ROUTES.profile,
  ];
  const axeIssues: { path: string; width: number; ids: string[] }[] = [];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    for (const [width, height] of SIZES) {
      await page.setViewportSize({ width, height });
      rows.push({ path, width, height, ...(await inspectLayout(page)) });
      if (width === 320 || width === 768) {
        const violations = (await new AxeBuilder({ page }).analyze()).violations;
        if (violations.length) axeIssues.push({ path, width, ids: violations.map((item) => item.id) });
      }
      if (
        [320, 768, 1440].includes(width) &&
        new Set<string>([ADMIN_ROUTES.fonts, ADMIN_ROUTES.services, ADMIN_ROUTES.settings]).has(path)
      )
        await page.screenshot({
          path: testInfo.outputPath(`${path.replaceAll("/", "-")}-${width}.png`),
          fullPage: true,
        });
    }
  }
  await page.goto(ADMIN_ROUTES.fonts);
  for (const [width, height] of SIZES.filter(([width]) => width < 1024)) {
    await page.setViewportSize({ width, height });
    await page.getByRole("button", { name: ADMIN_TEXT.menu, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: ADMIN_TEXT.menu });
    await expect(dialog).toBeVisible();
    rows.push({ path: `${ADMIN_ROUTES.fonts}#menu`, width, height, ...(await inspectLayout(page)) });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
  await writeFile(testInfo.outputPath("admin-layouts.json"), JSON.stringify({ rows, axeIssues }, null, 2));
  expect(failures(rows)).toEqual([]);
  expect(axeIssues).toEqual([]);
});

test("expanded page sections and media dialogs remain usable at phone, tablet and laptop sizes", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one expanded-editor state matrix");
  test.setTimeout(600_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);
  const rows: Observation[] = [];
  for (const key of PAGE_KEYS) {
    const path = ADMIN_ROUTES.page(key);
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    const sections = page.locator("main article h3 > button[aria-expanded]");
    for (const button of await sections.all()) {
      await button.click();
      const name = await button.innerText();
      for (const [width, height] of [SIZES[0], SIZES[5], SIZES[8]]) {
        await page.setViewportSize({ width, height });
        rows.push({ path: `${path}#${name.replace(/\s+/g, " ")}`, width, height, ...(await inspectLayout(page)) });
        if (key === "ABOUT" && width === 320)
          await page.screenshot({ path: testInfo.outputPath(`about-section-${rows.length}.png`), fullPage: true });
      }
      await button.click();
    }
  }
  const [service] = await listRecordsForAdmin("SERVICES");
  await page.goto(ADMIN_ROUTES.service(service.id));
  await page
    .getByRole("button", { name: new RegExp(`${ADMIN_TEXT.choosePhoto}|${ADMIN_TEXT.changePhoto}`) })
    .first()
    .click();
  const picker = page.getByRole("dialog");
  await expect(picker).toBeVisible();
  for (const [width, height] of [SIZES[0], SIZES[5], SIZES[6], SIZES[8]]) {
    await page.setViewportSize({ width, height });
    rows.push({ path: "admin#photo-picker", width, height, ...(await inspectLayout(page)) });
  }
  await picker.getByRole("button", { name: ADMIN_TEXT.uploadNew }).click();
  for (const [width, height] of [SIZES[0], SIZES[5], SIZES[8]]) {
    await page.setViewportSize({ width, height });
    rows.push({ path: "admin#photo-upload", width, height, ...(await inspectLayout(page)) });
  }
  await page.keyboard.press("Escape");
  await page.goto(ADMIN_ROUTES.media);
  await page
    .getByRole("main")
    .getByRole("button", { name: /Used in/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (const [width, height] of [SIZES[0], SIZES[5], SIZES[6], SIZES[8]]) {
    await page.setViewportSize({ width, height });
    rows.push({ path: "admin#media-details", width, height, ...(await inspectLayout(page)) });
    await page.screenshot({ path: testInfo.outputPath(`media-details-${width}.png`) });
  }
  await writeFile(testInfo.outputPath("expanded-admin-layouts.json"), JSON.stringify({ rows }, null, 2));
  expect(failures(rows)).toEqual([]);
});
