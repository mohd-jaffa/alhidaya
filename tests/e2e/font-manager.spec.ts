import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { DEFAULT_TYPOGRAPHY, FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import type { TypographyPayload } from "@/lib/validation/schemas/typography";
import { E2E_ORIGIN } from "@tests/support/e2e-app";

const RUN = crypto.randomUUID().slice(0, 8);
const PASSWORD = "a long font manager password";
const headers = { origin: E2E_ORIGIN };
test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `fonts-${RUN}-%`));
  await closeDb();
});
async function signIn(page: Page) {
  const email = `fonts-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  expect(
    (await page.request.post(ADMIN_API_ROUTES.adminSession, { data: { email, password: PASSWORD }, headers })).ok(),
  ).toBe(true);
}
const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
const family = (page: Page) =>
  page
    .locator(".site-world h1")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);

test("fonts save as a draft, preview privately, publish independently, then discard; admin stays unchanged", async ({
  page,
  browser,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);
  const original = (await (await page.request.get(ADMIN_API_ROUTES.adminTypography)).json()).data;
  const visitor = await browser.newPage();
  await visitor.emulateMedia({ reducedMotion: "reduce" });
  try {
    await page.goto(ADMIN_ROUTES.fonts);
    await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.fontManager })).toBeVisible();
    await expect(page.getByRole("combobox")).toHaveCount(20);
    const adminBefore = await page.getByRole("heading", { level: 1 }).evaluate((el) => getComputedStyle(el).fontFamily);
    await axe(page);
    await page.screenshot({ path: `docs/audits/2026-11-04-font-manager-${testInfo.project.name}.png` });
    const choice = page.getByRole("combobox", { name: ADMIN_TEXT.fontRoleLabels.h1 });
    await choice.selectOption("playfair-display");
    await page.getByRole("button", { name: ADMIN_TEXT.saveDraft }).click();
    await expect(page.getByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    await visitor.goto(ROUTES.home);
    expect(await family(visitor)).toMatch(/interTight/i);
    const preview = await page.context().newPage();
    await preview.goto(`${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.home)}`);
    expect(
      await preview.locator(".site-world").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--type-h1")),
    ).toBe(FONT_STACKS["playfair-display"]);
    const expectedFamily = await preview
      .locator(".site-world")
      .evaluate((el) =>
        getComputedStyle(el)
          .getPropertyValue("--font-playfair-display")
          .split(",")[0]
          .trim()
          .replaceAll('"', "")
          .replaceAll("'", ""),
      );
    expect((await family(preview)).replaceAll('"', "")).toContain(expectedFamily);
    await preview.close();
    await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(ADMIN_TEXT.fontManager))).toBeVisible();
    await visitor.reload();
    expect(
      await visitor.locator(".site-world").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--type-h1")),
    ).toBe(FONT_STACKS["playfair-display"]);
    await choice.selectOption("syne");
    await expect(page.getByRole("button", { name: ADMIN_TEXT.saveDraft })).toBeEnabled();
    await page.getByRole("button", { name: ADMIN_TEXT.saveDraft }).click();
    await expect(page.getByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    await page.getByRole("button", { name: ADMIN_TEXT.discardDraft, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: ADMIN_TEXT.discard, exact: true }).click();
    await expect(choice).toHaveValue("playfair-display");
    expect(await page.getByRole("heading", { level: 1 }).evaluate((el) => getComputedStyle(el).fontFamily)).toBe(
      adminBefore,
    );
    for (const width of [320, 390, 414, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await axe(page);
  } finally {
    await page.request.put(ADMIN_API_ROUTES.adminTypography, { data: original.draft, headers });
    await page.request.post(ADMIN_API_ROUTES.adminTypographyPublish, { headers });
    await visitor.close();
  }
});

test("all font roles load every bundled font and preserve public page fit across six widths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one complete six-width matrix");
  test.setTimeout(600_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const paths = [
    ROUTES.home,
    ROUTES.about,
    ROUTES.services,
    ROUTES.service("school-nurse-staffing"),
    ROUTES.careers,
    ROUTES.contact,
    ROUTES.quote,
    ROUTES.privacy,
    ROUTES.terms,
    ROUTES.applyGeneral,
  ];
  const results: { path: string; width: number; font: string; overflow: number }[] = [];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator(".site-world")).toBeVisible();
    for (const width of [320, 390, 414, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const font of FONT_IDS) {
        const result = await page.evaluate(
          async ({ roles, stack, font }) => {
            const world = document.querySelector<HTMLElement>(".site-world")!;
            for (const role of roles) world.style.setProperty(`--type-${role}`, stack);
            const variable = getComputedStyle(world).getPropertyValue(`--font-${font}`);
            for (const weight of [400, 500, 600, 700]) {
              const loaded = await document.fonts.load(`${weight} 16px ${variable}`, "Al Hidaya +974 care — 24/7");
              if (loaded.length === 0) throw new Error(`Font not loaded: ${font}/${weight}`);
            }
            await document.fonts.ready;
            return {
              overflow: document.documentElement.scrollWidth - innerWidth,
              badControls: [
                ...document.querySelectorAll<HTMLElement>(
                  ".site-world input:not([type=hidden]):not([type=checkbox]), .site-world textarea, .site-world select",
                ),
              ].filter((el) => el.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(el).fontSize) < 16)
                .length,
              clippedHeadings: [
                ...document.querySelectorAll<HTMLElement>(".site-world h1, .site-world h2, .site-world h3"),
              ]
                .filter((el) => el.getBoundingClientRect().width > 0 && el.scrollWidth > el.clientWidth + 2)
                .map((el) => el.textContent),
            };
          },
          { roles: FONT_ROLES, stack: FONT_STACKS[font], font },
        );
        expect(result, `${path} ${width} ${font}`).toMatchObject({ overflow: 0, badControls: 0, clippedHeadings: [] });
        if (path === ROUTES.home && (width === 320 || width === 414)) {
          await page.getByRole("button", { name: UI_TEXT.menu, exact: true }).click();
          const menu = page.getByRole("dialog", { name: UI_TEXT.menu });
          await expect(menu).toBeVisible();
          const fit = await menu.evaluate((el) => ({
            overflow: el.scrollWidth - el.clientWidth,
            clippedNumbers: [...el.querySelectorAll<HTMLElement>(".whitespace-nowrap")].filter(
              (item) => item.scrollWidth > item.clientWidth + 1,
            ).length,
          }));
          expect(fit, `${width} ${font} menu`).toEqual({ overflow: 0, clippedNumbers: 0 });
          await menu.getByRole("button", { name: UI_TEXT.close, exact: true }).click();
          await expect(menu).not.toBeVisible();
        }
        results.push({ path, width, font, overflow: result.overflow });
      }
    }
    await axe(page);
  }
  await writeFile(testInfo.outputPath("font-layout-matrix.json"), JSON.stringify(results, null, 2));
  await testInfo.attach("font-layout-matrix.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
});

test("mixed role assignments retain semantic fonts, including action links and errors", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one semantic role matrix");
  await signIn(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const original = (await (await page.request.get(ADMIN_API_ROUTES.adminTypography)).json()).data;
  const mixed: TypographyPayload = { roles: { ...DEFAULT_TYPOGRAPHY.roles } };
  FONT_ROLES.forEach((role, i) => {
    mixed.roles[role] = FONT_IDS[i % FONT_IDS.length];
  });
  try {
    expect((await page.request.put(ADMIN_API_ROUTES.adminTypography, { data: mixed, headers })).ok()).toBe(true);
    expect((await page.request.post(ADMIN_API_ROUTES.adminTypographyPublish, { headers })).ok()).toBe(true);
    await page.goto(ROUTES.contact);
    const semantic = await page.evaluate(
      ({ roles, ids }) => {
        const world = document.querySelector<HTMLElement>(".site-world")!;
        const tags: Record<string, string> = {
          h1: "h1",
          h2: "h2",
          h3: "h3",
          h4: "h4",
          lead: "p",
          paragraph: "p",
          small: "small",
          caption: "figcaption",
          label: "label",
          legend: "legend",
          input: "input",
          placeholder: "input",
          button: "a",
          link: "a",
          list: "li",
          status: "div",
          error: "p",
          detail: "dd",
          emphasis: "strong",
          summary: "summary",
        };
        const result: { role: string; correct: boolean }[] = [];
        const holder = document.createElement("div");
        holder.className = "sr-only";
        world.append(holder);
        for (const role of roles) {
          const el = document.createElement(tags[role]);
          if (role === "lead") el.className = "text-lead";
          if (role === "button") el.className = "font-role-button";
          if (["caption", "detail", "legend", "label", "h4", "link"].includes(role)) el.classList.add("text-small");
          if (role === "status" || role === "error") el.dataset.fontRole = role;
          if (role === "placeholder") el.setAttribute("placeholder", "Your full name");
          holder.append(el);
          const actual = getComputedStyle(el, role === "placeholder" ? "::placeholder" : null).fontFamily;
          const variable = getComputedStyle(world).getPropertyValue(`--font-${ids[role]}`).trim();
          result.push({
            role,
            correct: actual
              .replaceAll('"', "")
              .replaceAll("'", "")
              .startsWith(variable.split(",")[0].trim().replaceAll('"', "").replaceAll("'", "")),
          });
        }
        holder.remove();
        return result;
      },
      { roles: FONT_ROLES, ids: mixed.roles },
    );
    expect(semantic.filter((item) => !item.correct)).toEqual([]);
    for (const width of [320, 390, 414, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await axe(page);
  } finally {
    await page.request.put(ADMIN_API_ROUTES.adminTypography, { data: original.draft, headers });
    await page.request.post(ADMIN_API_ROUTES.adminTypographyPublish, { headers });
  }
});

test("cold, delayed font loads stay stable and request only fonts in use", async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one cold font-loading matrix at phone width");
  test.setTimeout(180_000);
  await signIn(page);
  const original = (await (await page.request.get(ADMIN_API_ROUTES.adminTypography)).json()).data;
  const results: { font: string; cls: number; requests: number }[] = [];
  try {
    for (const font of FONT_IDS) {
      const draft = { roles: Object.fromEntries(FONT_ROLES.map((role) => [role, font])) };
      expect((await page.request.put(ADMIN_API_ROUTES.adminTypography, { data: draft, headers })).ok()).toBe(true);
      expect((await page.request.post(ADMIN_API_ROUTES.adminTypographyPublish, { headers })).ok()).toBe(true);
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
      try {
        const visitor = await context.newPage();
        const files = new Set<string>();
        visitor.on("request", (request) => {
          if (request.url().endsWith(".woff2")) files.add(request.url());
        });
        await visitor.route("**/*.woff2", async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 250));
          await route.continue();
        });
        await visitor.addInitScript(() => {
          const shifts: number[] = [];
          Object.assign(window, { fontShifts: shifts });
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              if (!(entry as PerformanceEntry & { hadRecentInput: boolean }).hadRecentInput)
                shifts.push((entry as PerformanceEntry & { value: number }).value);
          }).observe({ type: "layout-shift", buffered: true });
        });
        await visitor.goto(ROUTES.home);
        await visitor.evaluate(() => document.fonts.ready);
        await visitor.waitForTimeout(400);
        const cls = await visitor.evaluate(() =>
          (window as unknown as { fontShifts: number[] }).fontShifts.reduce((sum, shift) => sum + shift, 0),
        );
        expect(cls, font).toBeLessThanOrEqual(0.05);
        expect(files.size, font).toBeLessThanOrEqual(font === "inter-tight" ? 1 : 2);
        expect(files.size, font).toBeGreaterThan(0);
        results.push({ font, cls, requests: files.size });
      } finally {
        await context.close();
      }
    }
    await writeFile(testInfo.outputPath("cold-font-loading.json"), JSON.stringify(results, null, 2));
    await testInfo.attach("cold-font-loading.json", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });
  } finally {
    await page.request.put(ADMIN_API_ROUTES.adminTypography, { data: original.draft, headers });
    await page.request.post(ADMIN_API_ROUTES.adminTypographyPublish, { headers });
  }
});
