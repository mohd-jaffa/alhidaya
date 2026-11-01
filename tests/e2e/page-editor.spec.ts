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
