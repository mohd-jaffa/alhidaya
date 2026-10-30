import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * Activity through the built app (R6.8, D96): the admin's changes newest
 * first in the day's log, who made each by name, narrowed by kind, axe at
 * both widths; and nothing without the admin's session.
 */
const PASSWORD = "a long activity password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `activity-${RUN}-%`));
  await closeDb();
});

/** Signs in as an admin named for this run, so the sign-in is found by who made it. */
async function signIn(page: Page): Promise<string> {
  const name = `Activity ${crypto.randomUUID().slice(0, 6)}`;
  const email = `activity-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name, password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
  return name;
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("Activity lists the sign-in just made, by who made it, and narrows by kind", async ({ page }) => {
  const name = await signIn(page);
  await page.goto(ADMIN_ROUTES.activity);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.activity })).toBeVisible();
  const mine = page.getByRole("article").filter({ hasText: name });
  await expect(mine.getByRole("heading", { level: 3, name: ADMIN_TEXT.didSignIn })).toBeVisible();
  const rail = page.getByRole("navigation", { name: ADMIN_TEXT.navigation }).first();
  if (await rail.isVisible()) {
    await expect(rail.getByRole("link", { name: ADMIN_TEXT.activity })).toHaveAttribute("aria-current", "page");
  }
  await axe(page);

  const kinds = page.getByRole("navigation", { name: ADMIN_TEXT.activity });
  await kinds.getByRole("link", { name: ADMIN_TEXT.activityKinds.SIGN_INS }).click();
  await expect(page).toHaveURL(`${ADMIN_ROUTES.activity}?kind=SIGN_INS`);
  await expect(kinds.getByRole("link", { name: ADMIN_TEXT.activityKinds.SIGN_INS })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(mine).toBeVisible();

  await kinds.getByRole("link", { name: ADMIN_TEXT.activityKinds.INBOX }).click();
  await expect(page).toHaveURL(`${ADMIN_ROUTES.activity}?kind=INBOX`);
  await expect(kinds.getByRole("link", { name: ADMIN_TEXT.activityKinds.INBOX })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByLabel(ADMIN_TEXT.loading)).toHaveCount(0);
  await expect(page.getByRole("article").filter({ hasText: name })).toHaveCount(0);
  await axe(page);
});

test("Activity's endpoint answers nothing without the admin's session", async ({ request }) => {
  const answer = await request.get(ADMIN_API_ROUTES.adminActivity);
  expect(answer.status()).toBe(401);
  expect(answer.headers()["cache-control"]).toContain("no-store");
});
