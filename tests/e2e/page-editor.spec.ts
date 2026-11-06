import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UI_TEXT } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { readDocumentDraft } from "@/lib/content/documents";
import type { PageDocument } from "@/lib/validation";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The Pages editor through the built app (R6.3, D86 – D90): the pages and
 * their state, a page's sections as rows opened in place, axe at both
 * widths; and, once, an edit saved, previewed, published and seen by a
 * visitor, then put back as it was through the same routes, so the app's
 * cache holds the page as published at launch for the journeys after this.
 */
const PASSWORD = "a long editor password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `editor-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `editor-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("Home's slider pill hides, previews, publishes and returns without losing its note (D157)", async ({
  page,
  browser,
}) => {
  await signIn(page);
  const original = (await readDocumentDraft<PageDocument>("PAGE:HOME"))!.draft;
  const visitorContext = await browser.newContext();
  const visitor = await visitorContext.newPage();
  const headers = { origin: E2E_ORIGIN };
  try {
    await page.goto(ADMIN_ROUTES.page("HOME"));
    await page.getByRole("button", { name: /Page header/, expanded: false }).click();
    const toggle = page.getByRole("switch", { name: ADMIN_TEXT.hideSliderPill });
    await visitor.goto(ROUTES.home);
    await expect(visitor.locator(".slide-note")).toHaveCount(1);
    for (const hidden of [true, false]) {
      await toggle.setChecked(hidden);
      const [preview] = await Promise.all([
        page.waitForEvent("popup"),
        page.getByRole("link", { name: ADMIN_TEXT.preview, exact: true }).click(),
      ]);
      await expect(preview.locator(".slide-note")).toHaveCount(hidden ? 0 : 1);
      await preview.close();
      await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
      const published = page.waitForResponse(
        (response) =>
          response.url().endsWith(ADMIN_API_ROUTES.adminPagePublish("HOME")) && response.request().method() === "POST",
      );
      await page
        .getByRole("dialog", { name: ADMIN_TEXT.publishTitle("Home") })
        .getByRole("button", { name: ADMIN_TEXT.publish, exact: true })
        .click();
      expect((await published).ok()).toBe(true);
      await visitor.reload();
      await expect(visitor.locator(".slide-note")).toHaveCount(hidden ? 0 : 1);
    }
    const saved = (await readDocumentDraft<PageDocument>("PAGE:HOME"))!.draft;
    const before = original.sections.find((s) => s.type === "SIGN");
    const after = saved.sections.find((s) => s.type === "SIGN");
    expect(after?.type === "SIGN" && after.content.note).toEqual(before?.type === "SIGN" && before.content.note);
    await axe(page);
  } finally {
    expect((await page.request.put(ADMIN_API_ROUTES.adminPage("HOME"), { data: original, headers })).ok()).toBe(true);
    expect((await page.request.post(ADMIN_API_ROUTES.adminPagePublish("HOME"), { headers })).ok()).toBe(true);
    await visitorContext.close();
  }
});

test("Careers' opening moves, hides, previews and publishes while its content stays available (D148)", async ({
  page,
  browser,
}) => {
  await signIn(page);
  const original = (await readDocumentDraft<PageDocument>("PAGE:CAREERS"))!.draft;
  const headline = original.sections.find((section) => section.type === "SIGN")!;
  const before = headline.type === "SIGN" ? headline.content.headline.en : "";
  const visitorContext = await browser.newContext();
  const visitor = await visitorContext.newPage();
  const headers = { origin: E2E_ORIGIN };
  try {
    await page.goto(ADMIN_ROUTES.page("CAREERS"));
    await page.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Page header") }).click();
    await page.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.hide, "Page header") }).click();
    await page.getByRole("button", { name: ADMIN_TEXT.saveDraft, exact: true }).click();
    await expect(page.getByText(ADMIN_TEXT.changesNotPublished, { exact: true })).toBeVisible();
    const saved = (await readDocumentDraft<PageDocument>("PAGE:CAREERS"))!.draft;
    expect(saved.sections.findIndex((section) => section.type === "SIGN")).toBe(1);
    expect(saved.sections.find((section) => section.type === "SIGN")!.visible).toBe(false);
    await visitor.goto(ROUTES.careers);
    await expect(visitor.getByRole("heading", { level: 1, name: before })).toBeVisible();
    const [preview] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: ADMIN_TEXT.preview, exact: true }).click(),
    ]);
    await expect(preview.getByRole("heading", { level: 1, name: UI_TEXT.openJobs })).toBeVisible();
    await expect(preview.getByRole("heading", { name: before, exact: true })).toHaveCount(0);
    await expect(preview.locator('[data-page="CAREERS"]')).toHaveCSS("padding-top", "0px");
    await preview.close();
    await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle("Careers") })
      .getByRole("button", { name: ADMIN_TEXT.publish, exact: true })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished("Careers"))).toBeVisible();
    await visitor.reload();
    await expect(visitor.getByRole("heading", { level: 1, name: UI_TEXT.openJobs })).toBeVisible();
    await expect(visitor.getByRole("heading", { name: before, exact: true })).toHaveCount(0);
    await expect(visitor.locator('[data-page="CAREERS"]')).toHaveCSS("padding-top", "0px");
    await axe(visitor);
    await axe(page);
    await page.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.show, "Page header") }).click();
    await page.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, "Page header") }).click();
  } finally {
    expect((await page.request.put(ADMIN_API_ROUTES.adminPage("CAREERS"), { data: original, headers })).ok()).toBe(
      true,
    );
    expect((await page.request.post(ADMIN_API_ROUTES.adminPagePublish("CAREERS"), { headers })).ok()).toBe(true);
    await visitorContext.close();
  }
});

for (const key of ["ABOUT", "SERVICES"] as const) {
  const title = key === "ABOUT" ? "About" : "Services";
  test(`${title}'s opening buttons can be enabled, previewed and hidden without losing their links (D156)`, async ({
    page,
    browser,
  }) => {
    await signIn(page);
    const original = (await readDocumentDraft<PageDocument>(`PAGE:${key}`))!.draft;
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();
    const path = key === "ABOUT" ? ROUTES.about : ROUTES.services;
    const headers = { origin: E2E_ORIGIN };
    try {
      await page.goto(ADMIN_ROUTES.page(key));
      await page.getByRole("button", { name: /Page header/, expanded: false }).click();
      const toggle = page.getByRole("switch", { name: ADMIN_TEXT.showOpeningButtons });
      await expect(toggle).not.toBeChecked();
      await visitor.goto(path);
      await expect(visitor.locator("#start").getByRole("link")).toHaveCount(0);
      for (const visible of [true, false]) {
        await toggle.setChecked(visible);
        const [preview] = await Promise.all([
          page.waitForEvent("popup"),
          page.getByRole("link", { name: ADMIN_TEXT.preview, exact: true }).click(),
        ]);
        await expect(preview.locator("#start").getByRole("link")).toHaveCount(visible ? 2 : 0);
        await preview.close();
        await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
        const published = page.waitForResponse(
          (response) =>
            response.url().endsWith(ADMIN_API_ROUTES.adminPagePublish(key)) && response.request().method() === "POST",
        );
        await page
          .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(title) })
          .getByRole("button", { name: ADMIN_TEXT.publish, exact: true })
          .click();
        expect((await published).ok()).toBe(true);
        await expect(page.getByText(ADMIN_TEXT.isPublished(title))).toBeVisible();
        await visitor.reload();
        await expect(visitor.locator("#start").getByRole("link")).toHaveCount(visible ? 2 : 0);
      }
    } finally {
      expect((await page.request.put(ADMIN_API_ROUTES.adminPage(key), { data: original, headers })).ok()).toBe(true);
      expect((await page.request.post(ADMIN_API_ROUTES.adminPagePublish(key), { headers })).ok()).toBe(true);
      await visitorContext.close();
    }
  });
}

test("Pages lists the eight pages with their state, and a page's editor passes axe with a section open", async ({
  page,
}) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.pages);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.pages })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Request a quote/ })).toContainText(ADMIN_TEXT.published);
  await axe(page);

  await page.getByRole("link", { name: /^Home/ }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.page("HOME"));
  await expect(page.getByRole("heading", { level: 1, name: "Home" })).toBeVisible();
  // Home's header is its slides (D128): each with its headline and photo, then the card on the photo's icon.
  await page.getByRole("button", { name: /Page header/, expanded: false }).click();
  await expect(page.getByRole("textbox", { name: ADMIN_TEXT.headline, exact: true }).first()).toBeVisible();
  await expect(page.getByRole("combobox", { name: new RegExp(`^${ADMIN_TEXT.icon}`) }).first()).toBeVisible();
  await axe(page);

  await page.getByRole("button", { name: ADMIN_TEXT.changePhoto }).first().click();
  const library = page.getByRole("dialog", { name: ADMIN_TEXT.choosePhoto });
  await expect(library.getByRole("button").nth(1)).toBeVisible();
  await axe(page);
  await library.getByRole("button", { name: UI_TEXT.close }).click();
});

test("an edit is saved, previewed, published and seen by a visitor (plan §14, D88)", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one page published once is enough");
  const original = (await readDocumentDraft<PageDocument>("PAGE:PRIVACY"))!.draft;
  const before = original.sections[0].type === "SIGN" ? original.sections[0].content.headline.en : "";
  const headline = `Privacy notice ${RUN}`;
  await signIn(page);
  const visitor = await browser.newPage();
  try {
    await page.goto(ADMIN_ROUTES.page("PRIVACY"));
    const bar = page.locator("form").filter({ has: page.getByRole("heading", { level: 1, name: "Privacy" }) });
    await expect(bar.getByText(ADMIN_TEXT.published)).toBeVisible();
    await page.getByRole("button", { name: /Page header/, expanded: false }).click();
    await page.getByRole("textbox", { name: ADMIN_TEXT.headline }).fill(headline);
    await expect(bar.getByText(ADMIN_TEXT.unsavedChanges)).toBeVisible();

    // Preview saves the change first, then shows it (D120).
    const [preview] = await Promise.all([
      page.waitForEvent("popup"),
      bar.getByRole("link", { name: ADMIN_TEXT.preview }).click(),
    ]);
    await expect(bar.getByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    await expect(page.getByRole("link", { name: /Pages/ }).first()).toContainText(/waiting to be published/);
    await expect(preview).toHaveURL(ROUTES.privacy);
    await expect(preview.getByRole("heading", { level: 1, name: headline })).toBeVisible();
    await expect(preview.getByRole("status").filter({ hasText: UI_TEXT.previewBar })).toBeVisible();
    await preview.close();

    await visitor.goto(ROUTES.privacy);
    await expect(visitor.getByRole("heading", { level: 1, name: before })).toBeVisible();

    await bar.getByRole("button", { name: ADMIN_TEXT.publish }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle("Privacy") })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished("Privacy"))).toBeVisible();
    await expect(bar.getByText(ADMIN_TEXT.published)).toBeVisible();

    await visitor.reload();
    await expect(visitor.getByRole("heading", { level: 1, name: headline })).toBeVisible();
  } finally {
    // Back as it was, through the app, so its cache drops the edit too.
    const headers = { origin: E2E_ORIGIN };
    await page.request.put(ADMIN_API_ROUTES.adminPage("PRIVACY"), { data: original, headers });
    await page.request.post(ADMIN_API_ROUTES.adminPagePublish("PRIVACY"), { headers });
    await visitor.close();
  }
  await page.goto(ROUTES.privacy);
  await expect(page.getByRole("heading", { level: 1, name: before })).toBeVisible();
});

test("leaving a page with unsaved changes asks first, and Leave without saving goes (D88)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the rail is a desktop's");
  await signIn(page);
  await page.goto(ADMIN_ROUTES.page("HOME"));
  await page.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.hide, "Client logos") }).click();
  await expect(page.getByText(ADMIN_TEXT.hidden)).toBeVisible();

  const rail = page.getByRole("complementary");
  await rail.getByRole("link", { name: /Dashboard/ }).click();
  const asking = page.getByRole("dialog", { name: ADMIN_TEXT.leaveTitle });
  await expect(asking).toBeVisible();
  await axe(page);
  await asking.getByRole("button", { name: ADMIN_TEXT.stay }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.page("HOME"));

  await rail.getByRole("link", { name: /Dashboard/ }).click();
  await asking.getByRole("button", { name: ADMIN_TEXT.leave }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.overview);
  expect((await readDocumentDraft<PageDocument>("PAGE:HOME"))!.draft.sections.every((section) => section.visible)).toBe(
    true,
  );
});
