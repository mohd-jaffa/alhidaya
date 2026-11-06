import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { SOCIAL_NETWORK_LABELS } from "@/constants/statuses";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { readDocumentDraft } from "@/lib/content/documents";
import type { SiteDocument } from "@/lib/validation";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * Settings through the built app (R6.6, D94): the site's content in groups,
 * axe at both widths; and, once, a brochure uploaded and published, which
 * /brochure and the old /profile.pdf then open, and a menu link hidden;
 * then the site put back as it was through the same routes.
 */
const PASSWORD = "a long settings password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `settings-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `settings-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("footer social links adapt to zero, one or multiple published networks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);
  const original = (await readDocumentDraft<SiteDocument>("SITE"))!.draft;
  const headers = { origin: E2E_ORIGIN };
  const networks: SiteDocument["social"] = [
    { network: "INSTAGRAM", url: "https://www.instagram.com/example/" },
    { network: "FACEBOOK", url: "https://www.facebook.com/example/" },
    { network: "LINKEDIN", url: "https://www.linkedin.com/company/example/" },
  ];
  try {
    for (const count of [0, 1, networks.length]) {
      const social = networks.slice(0, count);
      expect(
        (await page.request.put(ADMIN_API_ROUTES.adminSite, { data: { ...original, social }, headers })).ok(),
      ).toBe(true);
      expect((await page.request.post(ADMIN_API_ROUTES.adminSitePublish, { headers })).ok()).toBe(true);
      await page.goto(ROUTES.home);
      const footer = page.getByRole("contentinfo");
      const heading = footer.getByRole("heading", { name: UI_TEXT.followUs });
      const list = footer.getByRole("list", { name: UI_TEXT.followUs });
      if (count === 0) {
        await expect(heading).toHaveCount(0);
        await expect(list).toHaveCount(0);
        continue;
      }
      await expect(heading).toBeVisible();
      await expect(list.getByRole("link")).toHaveCount(count);
      let rowY: number | undefined;
      for (const network of social) {
        const name = SOCIAL_NETWORK_LABELS[network.network];
        const link = list.getByRole("link", { name, exact: true });
        await expect(link).toHaveAttribute("href", network.url);
        await expect(link.locator("svg")).toBeVisible();
        await expect(link).toHaveText(count === 1 ? name : "");
        const box = (await link.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        if (count > 1) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          const relativeY = box.y - (await list.boundingBox())!.y;
          if (rowY !== undefined) expect(relativeY).toBe(rowY);
          rowY = relativeY;
        }
        await link.focus();
        await expect(link).toBeFocused();
      }
      await axe(page);
    }
  } finally {
    expect((await page.request.put(ADMIN_API_ROUTES.adminSite, { data: original, headers })).ok()).toBe(true);
    expect((await page.request.post(ADMIN_API_ROUTES.adminSitePublish, { headers })).ok()).toBe(true);
  }
});

test("long editable navigation stays reachable through the existing menu at desktop and phone widths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "published once, checked at both widths");
  const original = (await readDocumentDraft<SiteDocument>("SITE"))!.draft;
  await signIn(page);
  const headers = { origin: E2E_ORIGIN };
  const paths = [
    ROUTES.home,
    ROUTES.about,
    ROUTES.services,
    ROUTES.careers,
    ROUTES.contact,
    ROUTES.quote,
    ROUTES.privacy,
    ROUTES.terms,
    ROUTES.service("elderly-care"),
    ROUTES.applyGeneral,
  ];
  const navigation = paths.map((href, at) => ({
    href,
    visible: true,
    label: { en: `Nursing care and staffing services across Doha ${at}` },
  }));
  try {
    expect(
      (await page.request.put(ADMIN_API_ROUTES.adminSite, { data: { ...original, navigation }, headers })).status(),
    ).toBe(200);
    expect((await page.request.post(ADMIN_API_ROUTES.adminSitePublish, { headers })).status()).toBe(200);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(ROUTES.home);
      await expect(page.getByRole("banner")).toHaveAttribute("data-compact", "true");
      const menu = page.getByRole("button", { name: UI_TEXT.menu, exact: true });
      await menu.click();
      const dialog = page.getByRole("dialog", { name: UI_TEXT.menu });
      for (const item of navigation)
        await expect(dialog.getByRole("link", { name: item.label.en, exact: true })).toBeVisible();
      const last = dialog.getByRole("link", { name: navigation.at(-1)!.label.en });
      await last.focus();
      await expect(last).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(menu).toBeFocused();
    }
  } finally {
    await page.request.put(ADMIN_API_ROUTES.adminSite, { data: original, headers });
    await page.request.post(ADMIN_API_ROUTES.adminSitePublish, { headers });
  }
});

test("Settings opens the site's content in its groups, and passes axe", async ({ page }) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.settings);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.settings })).toBeVisible();
  await expect(page.getByRole("textbox", { name: ADMIN_TEXT.companyName })).toHaveValue(/Al Hidaya/);
  await expect(page.getByRole("region", { name: ADMIN_TEXT.brochure })).toContainText(ADMIN_TEXT.noBrochure);
  await axe(page);
});

test("a brochure published opens at /brochure and /profile.pdf; a hidden menu link leaves the header (D94)", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the site's content is published once");
  const original = (await readDocumentDraft<SiteDocument>("SITE"))!.draft;
  await signIn(page);
  const visitor = await browser.newPage();
  try {
    await page.goto(ADMIN_ROUTES.settings);
    const brochure = page.getByRole("region", { name: ADMIN_TEXT.brochure });
    await brochure.getByLabel(ADMIN_TEXT.brochureFile).setInputFiles({
      name: "brochure.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(`%PDF-1.4\n% Al Hidaya brochure ${RUN}\n%%EOF\n`),
    });
    await brochure.getByRole("button", { name: ADMIN_TEXT.uploadBrochure }).click();
    await expect(brochure.getByRole("link", { name: ADMIN_TEXT.openBrochure })).toBeVisible();

    const menu = page.getByRole("region", { name: ADMIN_TEXT.headerMenu });
    await menu.getByRole("switch", { name: ADMIN_TEXT.shownInMenu }).first().uncheck();

    const bar = page.locator("form").filter({ has: page.getByRole("heading", { level: 1 }) });
    await bar.getByRole("button", { name: ADMIN_TEXT.publish }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(ADMIN_TEXT.settings) })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(ADMIN_TEXT.settings))).toBeVisible();

    const file = await visitor.request.get(ROUTES.brochure, { maxRedirects: 0 });
    expect(file.status()).toBe(307);
    expect(file.headers().location).toMatch(/\.pdf$/);
    const opened = await visitor.request.get("/profile.pdf");
    expect([opened.status(), opened.headers()["content-type"]]).toEqual([200, "application/pdf"]);
    expect(await opened.text()).toContain(RUN);

    await visitor.goto(ROUTES.home);
    const header = visitor.getByRole("banner");
    await expect(header.getByRole("link", { name: original.navigation[0].label.en, exact: true })).toHaveCount(0);
    // The header offers it in place of the quote, saved under the company's name (D116).
    await expect(header.getByRole("link", { name: UI_TEXT.brochureButton })).toHaveAttribute(
      "download",
      SITE.brochureFilename,
    );
    await expect(header.getByRole("link", { name: "Brochure", exact: true }).locator("svg")).toHaveCount(1);
    await visitor.setViewportSize({ width: 390, height: 844 });
    await visitor.getByRole("button", { name: UI_TEXT.menu, exact: true }).click();
    const mobileBrochure = visitor
      .getByRole("dialog", { name: UI_TEXT.menu })
      .getByRole("link", { name: "Brochure", exact: true });
    await expect(mobileBrochure).toHaveAttribute("download", SITE.brochureFilename);
    await expect(mobileBrochure.locator("svg")).toHaveCount(1);
  } finally {
    // Back as it was, through the app, so its cache drops the change and the brochure's file goes.
    const headers = { origin: E2E_ORIGIN };
    await page.request.put(ADMIN_API_ROUTES.adminSite, { data: original, headers });
    await page.request.post(ADMIN_API_ROUTES.adminSitePublish, { headers });
    await visitor.close();
  }
  expect((await page.request.get(ROUTES.brochure, { maxRedirects: 0 })).status()).toBe(404);
});
