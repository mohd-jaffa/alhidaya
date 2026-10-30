import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, records } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The client logos through the built app (R6.5, D92): the empty list and a
 * new logo's editor, axe at both widths; and, once, a logo added with an
 * image from the library, published to the home page's row of clients, and
 * archived, the row gone with it.
 */
const PASSWORD = "a long clients password";
const RUN = crypto.randomUUID().slice(0, 8);
const made: string[] = [];

test.afterAll(async () => {
  for (const id of made) await getDb().delete(records).where(eq(records.id, id));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `clients-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `clients-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("Clients says there are none yet, and a new logo's editor passes axe", async ({ page }) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.clients);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.clients })).toBeVisible();
  await expect(page.getByText(ADMIN_TEXT.noClients)).toBeVisible();
  await axe(page);
  await page.getByRole("link", { name: ADMIN_TEXT.newClient }).click();
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.newClient })).toBeVisible();
  await axe(page);
});

test("a logo is added, published to the home page and archived off it (D92)", async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one logo published once is enough");
  const name = `Test Hospital ${RUN}`;
  await signIn(page);
  const visitor = await browser.newPage();
  try {
    await visitor.goto(ROUTES.home);
    await expect(visitor.getByRole("heading", { name: "Our clients" })).toHaveCount(0);

    await page.goto(ADMIN_ROUTES.newClient);
    await page.getByRole("textbox", { name: ADMIN_TEXT.organisation }).fill(name);
    await page.getByRole("button", { name: ADMIN_TEXT.chooseLogo }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.chooseLogo })
      .getByRole("list")
      .getByRole("button")
      .first()
      .click();
    await expect(page.getByRole("button", { name: ADMIN_TEXT.changeLogo })).toBeVisible();
    const bar = page.locator("form").filter({ has: page.getByRole("heading", { level: 1 }) });
    await bar.getByRole("button", { name: ADMIN_TEXT.publish }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(ADMIN_TEXT.newClient) })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(name))).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/clients\/[0-9a-f-]{36}$/);
    made.push(page.url().split("/").at(-1)!);

    await visitor.reload();
    await expect(visitor.getByRole("heading", { name: "Our clients" })).toBeVisible();
    // The logo loads as the visitor reaches it, like every image below the fold.
    await visitor.locator("#clients").scrollIntoViewIfNeeded();
    await expect(visitor.getByRole("img", { name })).toBeVisible();

    const site = page.getByRole("region", { name: ADMIN_TEXT.onTheSite });
    await site.getByRole("button", { name: ADMIN_TEXT.archive }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.archiveTitle(name) })
      .getByRole("button", { name: ADMIN_TEXT.archive })
      .click();
    await expect(site.getByText(ADMIN_TEXT.isArchived)).toBeVisible();
    await visitor.reload();
    await expect(visitor.getByRole("heading", { name: "Our clients" })).toHaveCount(0);
  } finally {
    await visitor.close();
  }
});
