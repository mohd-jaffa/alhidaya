import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { readDocumentDraft } from "@/lib/content/documents";
import type { PageDocument, ServiceDocument, SiteDocument } from "@/lib/validation";
import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { initialScripts, PERFORMANCE_BUDGET, scriptBytes } from "@tests/support/performance";

const RUN = crypto.randomUUID().slice(0, 8);
const PASSWORD = "a long inline copy password";
const headers = { origin: E2E_ORIGIN };
const COPY = "**Quality nursing** *care* ***today***";
const VISIBLE = "Quality nursing care today";

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `inline-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `inline-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  expect(
    (await page.request.post(ADMIN_API_ROUTES.adminSession, { data: { email, password: PASSWORD }, headers })).ok(),
  ).toBe(true);
}

async function publish(page: Page, endpoint: string, publishEndpoint: string, data: unknown) {
  expect((await page.request.put(endpoint, { data, headers })).ok(), endpoint).toBe(true);
  expect((await page.request.post(publishEndpoint, { headers })).ok(), publishEndpoint).toBe(true);
}

test("inline copy saves, previews privately, publishes and discards without changing the public budget", async ({
  page,
  browser,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);
  const original = (await readDocumentDraft<PageDocument>("PAGE:HOME"))!.draft;
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const visitor = await context.newPage();
  try {
    const html = await (await page.request.get(ROUTES.home)).text();
    expect
      .soft((await scriptBytes(initialScripts(html))).total, "initial public JavaScript budget")
      .toBeLessThanOrEqual(PERFORMANCE_BUDGET.initialJavaScript);
    await page.goto(ADMIN_ROUTES.page("HOME"));
    await expect(page.getByText(ADMIN_TEXT.inlineFormattingHint)).toBeVisible();
    await page.getByRole("button", { name: /Page header/, expanded: false }).click();
    const headline = page.getByRole("textbox", { name: ADMIN_TEXT.headline, exact: true }).first();
    await headline.fill(COPY);
    await page.getByRole("textbox", { name: ADMIN_TEXT.highlight }).first().fill("nursing care");
    const [preview] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: ADMIN_TEXT.preview, exact: true }).click(),
    ]);
    await preview.emulateMedia({ reducedMotion: "reduce" });
    const title = preview.getByRole("heading", { level: 1, name: VISIBLE, exact: true });
    await expect(title).toBeVisible();
    await title.screenshot({ path: info.outputPath("formatted-home-heading.png") });
    await expect(title.locator("strong")).toHaveCount(3);
    await expect(title.locator("em")).toHaveCount(2);
    expect(await title.locator('[aria-hidden="true"]').textContent()).toBe(VISIBLE);
    expect(await title.locator(".text-deep").allTextContents()).toEqual(["nursing", "care"]);
    await visitor.goto(ROUTES.home);
    await expect(visitor.getByRole("heading", { level: 1, name: VISIBLE, exact: true })).toHaveCount(0);
    await preview.close();
    await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await expect(page.getByText(ADMIN_TEXT.isPublished("Home"))).toBeVisible();
    await visitor.reload();
    await expect(visitor.getByRole("heading", { name: VISIBLE, exact: true })).toBeVisible();
    await headline.fill("**Unpublished change**");
    await page.getByRole("button", { name: ADMIN_TEXT.saveDraft, exact: true }).click();
    await expect(page.getByText(ADMIN_TEXT.changesNotPublished, { exact: true })).toBeVisible();
    await visitor.reload();
    await expect(visitor.getByRole("heading", { name: VISIBLE, exact: true })).toBeVisible();
    await page.getByRole("button", { name: ADMIN_TEXT.discardDraft, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: ADMIN_TEXT.discard, exact: true }).click();
    await page.getByRole("button", { name: /Page header/, expanded: false }).click();
    await expect(headline).toHaveValue(COPY);
    expect((await new AxeBuilder({ page: visitor }).analyze()).violations).toEqual([]);
  } finally {
    await publish(page, ADMIN_API_ROUTES.adminPage("HOME"), ADMIN_API_ROUTES.adminPagePublish("HOME"), original);
    await context.close();
  }
});

test("service emphasis remains safe and its metadata and form choices use plain words", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);
  const list = (await (await page.request.get(ADMIN_API_ROUTES.adminServices)).json()).data;
  const id = list.items[0].id as string;
  const original = (await (await page.request.get(ADMIN_API_ROUTES.adminService(id))).json()).data
    .draft as ServiceDocument;
  const changed: ServiceDocument = {
    ...original,
    name: { en: "**Care** for *families*" },
    summary: { en: "***Round-the-clock*** care and **reassurance**." },
    seo: { title: { en: "**Care** for *families*" }, description: { en: "**Safe** support" } },
    description: [{ type: "paragraph", text: { en: "<script>escaped</script> **Safe care** and *support*" } }],
    included: [{ en: "**Kind** *support*" }],
    headerButtons: [{ label: { en: "***Ask us***" }, href: ROUTES.contact }],
  };
  try {
    await publish(page, ADMIN_API_ROUTES.adminService(id), ADMIN_API_ROUTES.adminServicePublish(id), changed);
    await page.goto(ROUTES.service(original.slug));
    await expect(page.getByRole("heading", { level: 1, name: "Care for families", exact: true })).toBeVisible();
    await expect(page.locator("h1 strong")).toHaveText("Care");
    await expect(page.getByRole("link", { name: "Ask us", exact: true })).toHaveAttribute("href", ROUTES.contact);
    const paragraph = page.locator("main p").filter({ hasText: "<script>escaped</script>" });
    await expect(paragraph).toContainText("<script>escaped</script> Safe care and support");
    await expect(paragraph.locator("script, img")).toHaveCount(0);
    await expect(paragraph.locator("strong")).toHaveText("Safe care");
    await expect(page).toHaveTitle(/Care for families/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Safe support");
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schemas.map((raw) => JSON.parse(raw))).toContainEqual(
      expect.objectContaining({ "@type": "Service", name: "Care for families" }),
    );
    await page.goto(`${ROUTES.quote}?service=${original.slug}`);
    const choice = page.locator(`option[value="${original.slug}"]`);
    await expect(choice).toHaveText("Care for families");
    await expect(choice.locator("strong, em")).toHaveCount(0);
    await expect(page.getByRole("combobox")).toHaveValue(original.slug);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  } finally {
    await publish(page, ADMIN_API_ROUTES.adminService(id), ADMIN_API_ROUTES.adminServicePublish(id), original);
  }
});

test("formatted sections, typewriter and navigation fit all fonts and enlarged mobile copy", async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);
  const about = (await readDocumentDraft<PageDocument>("PAGE:ABOUT"))!.draft;
  const contact = (await readDocumentDraft<PageDocument>("PAGE:CONTACT"))!.draft;
  const site = (await readDocumentDraft<SiteDocument>("SITE"))!.draft;
  const nextAbout = structuredClone(about);
  const nextContact = structuredClone(contact);
  const nextSite = structuredClone(site);
  for (const section of nextAbout.sections) {
    if (section.type === "INTRO") {
      section.content.heading.en = "**Who** *we are*";
      section.content.body = [{ type: "paragraph", text: { en: "**Clarity** and *kindness* guide our ***care***." } }];
    }
    if (section.type === "VALUES")
      for (const item of section.content.items) {
        item.title.en = `**${item.title.en}**`;
        item.text.en = "**Compassion** and *respect*, with ***dignity***.";
      }
    if (section.type === "MISSION") {
      section.content.mission.en = "**Our mission** is *kind care*.";
      section.content.vision.en = "***Care and dignity*** for everyone.";
    }
  }
  const sign = nextContact.sections.find((section) => section.type === "SIGN")!;
  if (sign.type === "SIGN") sign.content.headline.en = "**Here** *day* and ***night***";
  for (const section of nextContact.sections) {
    if (section.type === "CONTACT_DETAILS") section.content.heading.en = "**Reach** *us*";
    if (section.type === "FORM") section.content.heading.en = "**Send** *a message*";
  }
  nextSite.navigation[0].label.en = "**Home**";
  nextSite.footer[0].heading.en = "**Company**";
  nextSite.description.en = "**Quality care** and *support*.";
  nextSite.contact.address[0].en = "*Literal* office address";
  nextSite.contact.email = "care*team@example.com";
  try {
    await publish(page, ADMIN_API_ROUTES.adminPage("ABOUT"), ADMIN_API_ROUTES.adminPagePublish("ABOUT"), nextAbout);
    await publish(
      page,
      ADMIN_API_ROUTES.adminPage("CONTACT"),
      ADMIN_API_ROUTES.adminPagePublish("CONTACT"),
      nextContact,
    );
    await publish(page, ADMIN_API_ROUTES.adminSite, ADMIN_API_ROUTES.adminSitePublish, nextSite);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of [ROUTES.about, ROUTES.contact]) {
      await page.goto(path);
      await expect(page.locator("main strong").first()).toBeVisible();
      if (path === ROUTES.about) {
        await expect(page.locator("[data-mission-statement] strong").first()).toHaveText("Our mission");
        await expect(page.locator(".promise-card strong").first()).toBeVisible();
      } else {
        await expect(page.getByRole("heading", { level: 1, name: "Here day and night" })).toBeVisible();
        expect(await page.locator("h1 [data-type-letter]").count()).toBe(15);
        await expect(page.getByText("*Literal* office address", { exact: true })).toBeVisible();
        await expect(page.locator('a[href="mailto:care*team@example.com"]').first()).toBeVisible();
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({ path: info.outputPath(`formatted-${path.slice(1)}.png`) });
      if (info.project.name === "desktop") {
        for (const width of [320, 390, 768, 1440])
          for (const scale of [1, 2])
            for (const font of FONT_IDS) {
              await page.setViewportSize({ width, height: 900 });
              const result = await page.evaluate(
                async ({ roles, stack, scale, font }) => {
                  document.documentElement.style.fontSize = `${scale * 100}%`;
                  const world = document.querySelector<HTMLElement>(".site-world")!;
                  for (const role of roles) world.style.setProperty(`--type-${role}`, stack);
                  const family = getComputedStyle(world).getPropertyValue(`--font-${font}`).split(",")[0].trim();
                  await document.fonts.load(`700 16px ${family}`, "Quality care");
                  await document.fonts.ready;
                  return {
                    overflow: document.documentElement.scrollWidth > innerWidth,
                    clipped: [...document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p")]
                      .filter((el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2)
                      .map((el) => el.tagName),
                  };
                },
                { roles: FONT_ROLES, stack: FONT_STACKS[font], scale, font },
              );
              expect(result, `${path}/${width}/${scale}/${font}`).toEqual({ overflow: false, clipped: [] });
            }
        await page.setViewportSize({ width: 320, height: 900 });
        await page.evaluate(
          async ({ roles, stack }) => {
            document.documentElement.style.fontSize = "200%";
            const world = document.querySelector<HTMLElement>(".site-world")!;
            for (const role of roles) world.style.setProperty(`--type-${role}`, stack);
            await document.fonts.ready;
          },
          { roles: FONT_ROLES, stack: FONT_STACKS["source-sans-3"] },
        );
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: info.outputPath(`formatted-${path.slice(1)}-320-enlarged.png`) });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "100%";
        });
      }
    }
    expect(errors).toEqual([]);
  } finally {
    await publish(page, ADMIN_API_ROUTES.adminPage("ABOUT"), ADMIN_API_ROUTES.adminPagePublish("ABOUT"), about);
    await publish(page, ADMIN_API_ROUTES.adminPage("CONTACT"), ADMIN_API_ROUTES.adminPagePublish("CONTACT"), contact);
    await publish(page, ADMIN_API_ROUTES.adminSite, ADMIN_API_ROUTES.adminSitePublish, site);
  }
});
