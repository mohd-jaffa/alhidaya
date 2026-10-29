import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UI_TEXT } from "@/constants/messages";
import { ADMIN_ROUTES, ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";

import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { deleteMail, mailText, waitForMail } from "@tests/support/mailpit";

/**
 * Phase 4 end to end (plan §10, R4.5): a school asks for a quote; the team's
 * alert arrives; the admin follows its link, signs in, finds the enquiry
 * open and moves it along.
 */
const RUN = crypto.randomUUID().slice(0, 8);
const ADMIN = `journey-${RUN}@example.com`;
const VISITOR = `journey-visitor-${RUN}@example.com`;
const PASSWORD = "a long journey password";

test.afterAll(async () => {
  await getDb().delete(enquiries).where(eq(enquiries.email, VISITOR));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `journey-${RUN}%`));
  await closeDb();
});

test("a quote request reaches the team's inbox and is handled from the alert's link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one journey through mail and the admin is enough");
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250) + 1}` });

  // The visitor.
  await page.goto(ROUTES.quoteFor("school-nurse-staffing"));
  await page.getByRole("textbox", { name: UI_TEXT.yourName, exact: true }).fill("Journey School");
  await page.getByRole("radio", { name: "A school" }).check();
  await page.getByRole("textbox", { name: UI_TEXT.phone, exact: true }).fill("4411 2233");
  await page.getByRole("textbox", { name: UI_TEXT.email, exact: true }).fill(VISITOR);
  await page.getByRole("radio", { name: "A phone call" }).check();
  await page.getByRole("textbox", { name: UI_TEXT.message, exact: true }).fill("A nurse for the new term.");
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
  await expect(page.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);
  await page.getByRole("button", { name: UI_TEXT.sendQuote }).click();
  await expect(page.getByRole("group", { name: UI_TEXT.quoteSent })).toBeVisible();

  // The team's alert, and its link to the inbox.
  const [alert] = await waitForMail(`"${VISITOR}"`);
  const link = (await mailText(alert.ID)).match(new RegExp(`${E2E_ORIGIN}/admin/enquiries/[0-9a-f-]+`))?.[0];
  expect(link).toBeDefined();
  await deleteMail([alert.ID]);

  // The admin follows it, signs in, and lands on the enquiry, open.
  await createAdmin({ email: ADMIN, name: "Journey", password: PASSWORD });
  await page.setExtraHTTPHeaders({});
  await page.goto(link as string);
  await expect(page).toHaveURL(new RegExp(`${ADMIN_ROUTES.login}\\?next=`));
  await page.getByRole("textbox", { name: ADMIN_TEXT.email }).fill(ADMIN);
  await page.getByLabel(ADMIN_TEXT.password, { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: ADMIN_TEXT.signIn }).click();
  await expect(page).toHaveURL(link as string);

  const row = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom("Journey School")) });
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("A nurse for the new term.")).toBeVisible();
  await expect(page.getByRole("link", { name: ADMIN_TEXT.call })).toHaveAttribute("href", "tel:+97444112233");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "In progress", exact: true }).click();
  await expect(row).toContainText("In progress");
  const [stored] = await getDb()
    .select({ status: enquiries.status })
    .from(enquiries)
    .where(eq(enquiries.email, VISITOR));
  expect(stored.status).toBe("IN_PROGRESS");
});
