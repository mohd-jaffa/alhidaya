import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, API_ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { submitEnquiry } from "@/features/enquiries/api";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The admin, through the built app (plan §16, R6.1, R6.2, R4.4): signing in,
 * Today's log of what needs the admin, an enquiry handled in its row, the
 * Enquiries inbox, the alert email's link, the phone's menu and signing out;
 * axe on every screen at both widths.
 */
const PASSWORD = "a long admin password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(enquiries)
    .where(like(enquiries.email, `admin-e2e-${RUN}-%`));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `admin-${RUN}-%`));
  await closeDb();
});

/** An admin of this journey's own, so no lockout or session is shared. */
async function admin(name: string) {
  const email = `admin-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name, password: PASSWORD });
  return email;
}

/** An enquiry of this journey's own, new and waiting. */
async function enquiry(name: string, phone = "+97455512345") {
  return submitEnquiry(
    {
      form: "QUOTE",
      name,
      email: `admin-e2e-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`,
      phone,
      fields: [
        { label: "Service", value: "School nurse staffing" },
        { label: "Message", value: "Two school nurses from January." },
      ],
    },
    `admin-e2e-${crypto.randomUUID()}`,
  );
}

async function signIn(page: Page, email: string) {
  const answer = await page.request.post(API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("signing in: the way in, a refusal in plain words, then on to where the admin was headed", async ({ page }) => {
  const email = await admin("Fatima");
  await page.goto(ADMIN_ROUTES.enquiries);
  await expect(page).toHaveURL(`${ADMIN_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.enquiries)}`);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.signInTitle })).toBeVisible();
  await axe(page);

  await page.getByRole("textbox", { name: ADMIN_TEXT.email }).fill(email);
  await page.getByLabel(ADMIN_TEXT.password, { exact: true }).fill("not the password at all");
  await page.getByRole("button", { name: ADMIN_TEXT.signIn }).click();
  const refusal = page.getByRole("alert").filter({ hasText: ADMIN_TEXT.notSignedIn });
  await expect(refusal).toContainText(ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS);
  await axe(page);

  await page.getByLabel(ADMIN_TEXT.password, { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: ADMIN_TEXT.signIn }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.enquiries);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.enquiries })).toBeVisible();
});

test("the password's way back: a link asked for, and a reset page without one", async ({ page }) => {
  await page.goto(ADMIN_ROUTES.forgotPassword);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.forgotTitle })).toBeVisible();
  await axe(page);
  await page.goto(ADMIN_ROUTES.resetPassword);
  await expect(page.getByRole("status")).toContainText(ADMIN_TEXT.resetLinkMissing);
  await axe(page);
});

test("Today shows what needs the admin, and an enquiry is handled where it is", async ({ page }) => {
  const email = await admin("Fatima");
  const name = `Today Visitor ${RUN}`;
  await enquiry(name);
  await signIn(page, email);
  await page.goto(ADMIN_ROUTES.overview);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.today })).toBeVisible();
  await expect(page.getByRole("link", { name: ADMIN_TEXT.needsYou, exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );

  const row = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom(name)) });
  await expect(row).toContainText("School nurse staffing");
  await expect(row).toContainText("New");
  await axe(page);

  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  const opened = page.locator(`#${await row.getAttribute("aria-controls")}`.replaceAll(":", "\\:"));
  await expect(opened.getByText("Two school nurses from January.")).toBeVisible();
  await expect(opened.getByRole("link", { name: ADMIN_TEXT.call })).toHaveAttribute("href", "tel:+97455512345");
  await axe(page);

  await opened.getByRole("textbox", { name: ADMIN_TEXT.addNote }).fill("Called back; visit on Sunday.");
  await opened.getByRole("button", { name: ADMIN_TEXT.saveNote }).click();
  await expect(opened.getByText("Called back; visit on Sunday.")).toBeVisible();
  await expect(opened.getByText(/^Fatima, /)).toBeVisible();

  // Moved along, it no longer needs the admin.
  await opened.getByRole("button", { name: "In progress" }).click();
  await expect(row).toHaveCount(0);
  await page.getByRole("link", { name: ADMIN_TEXT.everything, exact: true }).click();
  await expect(page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom(name)) })).toContainText("In progress");
});

test("the Enquiries inbox finds an enquiry by its phone as typed, and the alert's link opens it", async ({ page }) => {
  const email = await admin("Fatima");
  const name = `Inbox Visitor ${RUN}`;
  const id = await enquiry(name, "+97433217788");
  await signIn(page, email);

  await page.goto(ADMIN_ROUTES.enquiries);
  await page.getByRole("searchbox", { name: ADMIN_TEXT.search }).fill("3321 7788");
  await page.getByRole("button", { name: ADMIN_TEXT.find }).click();
  await expect(page).toHaveURL(/q=3321\+7788/);
  await expect(page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom(name)) })).toBeVisible();
  await axe(page);

  await page.goto(ADMIN_ROUTES.enquiry(id));
  const row = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom(name)) });
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: ADMIN_TEXT.emailAction }).first()).toBeVisible();
});

test("on a phone the sections open as a menu; signing out leaves the admin behind", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "the menu is the phone's");
  const email = await admin("Fatima");
  await signIn(page, email);
  await page.goto(ADMIN_ROUTES.overview);
  await expect(page.getByRole("banner")).toContainText(ADMIN_TEXT.today);
  await page.getByRole("button", { name: ADMIN_TEXT.menu }).click();
  const menu = page.getByRole("dialog", { name: ADMIN_TEXT.menu });
  await axe(page);
  await menu.getByRole("link", { name: new RegExp(ADMIN_TEXT.enquiries) }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.enquiries);
  await expect(page.getByRole("banner")).toContainText(ADMIN_TEXT.enquiries);

  await page.getByRole("button", { name: ADMIN_TEXT.menu }).click();
  await page.getByRole("dialog", { name: ADMIN_TEXT.menu }).getByRole("button", { name: ADMIN_TEXT.signOut }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.login);
  await page.goto(ADMIN_ROUTES.overview);
  await expect(page).toHaveURL(new RegExp(`^${E2E_ORIGIN}${ADMIN_ROUTES.login}`));
  // The account is still there; only the session ended.
  expect(await getDb().select({ id: authUser.id }).from(authUser).where(eq(authUser.email, email))).toHaveLength(1);
});
