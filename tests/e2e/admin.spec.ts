import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { closeDb, getDb } from "@/db/client";
import { applications, authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { receiveApplication } from "@/features/careers/api";
import { submitEnquiry } from "@/features/enquiries/api";
import { applicationFormSchema } from "@/lib/validation";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The admin, through the built app (plan §16, R6.1, R6.2, R4.4, R5.5):
 * signing in, Today's log of what needs the admin, an enquiry handled in its
 * row and deleted once asked (D82), the Enquiries and Applications inboxes,
 * the alert email's link, the phone's menu and signing out; axe on every
 * screen at both widths.
 */
const PASSWORD = "a long admin password";
const RUN = crypto.randomUUID().slice(0, 8);

test.afterAll(async () => {
  await getDb()
    .delete(enquiries)
    .where(like(enquiries.email, `admin-e2e-${RUN}-%`));
  await getDb()
    .delete(applications)
    .where(like(applications.email, `admin-e2e-${RUN}-%`));
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

/** An application of this journey's own, new and waiting, its CV kept. */
async function application(name: string, phone = "5551 2345") {
  const { id } = await receiveApplication(
    applicationFormSchema.parse({
      name,
      email: `admin-e2e-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`,
      phone,
      whereNow: "OUTSIDE_QATAR",
      mophLicence: "IN_PROGRESS",
      dataflow: "DONE",
      prometric: "NOT_YET",
      experienceYears: "4",
      consent: true,
      turnstileToken: "token-from-cloudflare",
      cv: new File(["%PDF-1.7 a CV"], "cv.pdf"),
    }),
    `admin-e2e-${crypto.randomUUID()}`,
  );
  return id;
}

async function signIn(page: Page, email: string) {
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
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
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.dashboard })).toBeVisible();
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

test("an enquiry is deleted from its row only once asked, and Keep it leaves it be (D82)", async ({ page }) => {
  const email = await admin("Fatima");
  const name = `Delete Visitor ${RUN}`;
  const id = await enquiry(name);
  await signIn(page, email);
  await page.goto(ADMIN_ROUTES.enquiry(id));
  const row = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom(name)) });
  await expect(row).toHaveAttribute("aria-expanded", "true");

  await page.getByRole("button", { name: ADMIN_TEXT.delete, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: ADMIN_TEXT.deleteEnquiryTitle(name) });
  await expect(dialog).toContainText(ADMIN_TEXT.deleteEnquiryBody);
  await axe(page);
  await dialog.getByRole("button", { name: ADMIN_TEXT.keep }).click();
  await expect(dialog).toBeHidden();
  await expect(row).toBeVisible();

  await page.getByRole("button", { name: ADMIN_TEXT.delete, exact: true }).click();
  await dialog.getByRole("button", { name: ADMIN_TEXT.delete, exact: true }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.enquiries);
  await expect(row).toHaveCount(0);
  expect(await getDb().select({ id: enquiries.id }).from(enquiries).where(eq(enquiries.id, id))).toEqual([]);
});

test("a new application waits in Today; the Applications inbox finds it by job and phone and opens it with its CV", async ({
  page,
}) => {
  const email = await admin("Fatima");
  const name = `Applicant ${RUN}`;
  await application(name, "3321 6655");
  await signIn(page, email);

  await page.goto(ADMIN_ROUTES.overview);
  const inToday = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.applicationFrom(name)) });
  await expect(inToday).toContainText(ADMIN_TEXT.generalApplication);

  await page.goto(ADMIN_ROUTES.applications);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.applications })).toBeVisible();
  await page.getByRole("combobox", { name: ADMIN_TEXT.job }).selectOption({ label: ADMIN_TEXT.generalApplications });
  await page.getByRole("searchbox", { name: ADMIN_TEXT.search }).fill("3321 6655");
  await page.getByRole("button", { name: ADMIN_TEXT.find }).click();
  await expect(page).toHaveURL(/job=general/);
  const row = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.applicationFrom(name)) });
  await expect(row).toBeVisible();
  await axe(page);

  await row.click();
  const opened = page.locator(`#${await row.getAttribute("aria-controls")}`.replaceAll(":", "\\:"));
  await expect(opened.getByText("Outside Qatar")).toBeVisible();
  await expect(opened.getByRole("link", { name: ADMIN_TEXT.downloadCv })).toHaveAttribute("download", "");
  await axe(page);
  await opened.getByRole("button", { name: "In review" }).click();
  await expect(row).toContainText("In review");
});

test("on a phone the sections open as a menu; signing out leaves the admin behind", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "the menu is the phone's");
  const email = await admin("Fatima");
  await signIn(page, email);
  await page.goto(ADMIN_ROUTES.overview);
  await expect(page.getByRole("banner")).toContainText(ADMIN_TEXT.dashboard);
  await page.getByRole("button", { name: ADMIN_TEXT.menu }).click();
  const menu = page.getByRole("dialog", { name: ADMIN_TEXT.menu });
  await axe(page);
  await menu.getByRole("link", { name: new RegExp(ADMIN_TEXT.enquiries) }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.enquiries);
  await expect(page.getByRole("banner")).toContainText(ADMIN_TEXT.enquiries);

  await page.getByRole("button", { name: ADMIN_TEXT.menu }).click();
  await page.getByRole("dialog", { name: ADMIN_TEXT.menu }).getByRole("button", { name: ADMIN_TEXT.signOut }).click();
  // Asked first (D115).
  await page
    .getByRole("dialog", { name: ADMIN_TEXT.signOutTitle })
    .getByRole("button", { name: ADMIN_TEXT.signOut })
    .click();
  await expect(page).toHaveURL(ADMIN_ROUTES.login);
  await page.goto(ADMIN_ROUTES.overview);
  await expect(page).toHaveURL(new RegExp(`^${E2E_ORIGIN}${ADMIN_ROUTES.login}`));
  // The account is still there; only the session ended.
  expect(await getDb().select({ id: authUser.id }).from(authUser).where(eq(authUser.email, email))).toHaveLength(1);
});

test("the admin renames themselves and changes their password from their profile (D115)", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one change of password is enough");
  const email = await admin("Fatima");
  await signIn(page, email);
  await page.goto(ADMIN_ROUTES.overview);
  const column = page.getByRole("complementary");
  await column.getByRole("link", { name: ADMIN_TEXT.profile }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.profile);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.profile })).toBeVisible();
  await axe(page);

  const details = page.locator("section", { has: page.getByRole("heading", { name: ADMIN_TEXT.accountDetails }) });
  await expect(details).toContainText(email);
  await details.getByRole("textbox", { name: ADMIN_TEXT.name }).fill("Fatima Ali");
  await details.getByRole("button", { name: ADMIN_TEXT.saveName }).click();
  await expect(details.getByText(ADMIN_TEXT.nameSaved)).toBeVisible();
  await expect(column).toContainText(ADMIN_TEXT.signedInAs("Fatima Ali"));

  const change = page.locator("section", { has: page.getByRole("heading", { name: ADMIN_TEXT.changePassword }) });
  const fill = async (current: string) => {
    await change.getByLabel(ADMIN_TEXT.currentPassword).fill(current);
    await change.getByLabel(ADMIN_TEXT.newPassword, { exact: true }).fill("a brand new admin password");
    await change.getByLabel(ADMIN_TEXT.confirmPassword).fill("a brand new admin password");
    await change.getByRole("button", { name: ADMIN_TEXT.savePassword }).click();
  };
  await fill("not the password");
  await expect(change.getByText(ERROR_MESSAGES.AUTH_PASSWORD_WRONG)).toBeVisible();
  await fill(PASSWORD);
  await expect(change.getByText(ADMIN_TEXT.passwordUpdated)).toBeVisible();

  // This session stays; the next sign-in takes the new password, not the old.
  await page.goto(ADMIN_ROUTES.activity);
  await expect(page.getByRole("main")).toContainText(ADMIN_TEXT.didChangePassword);
  await expect(page.getByRole("main")).toContainText(ADMIN_TEXT.didRename);
  await column.getByRole("button", { name: ADMIN_TEXT.signOut }).click();
  await page
    .getByRole("dialog", { name: ADMIN_TEXT.signOutTitle })
    .getByRole("button", { name: ADMIN_TEXT.signOut })
    .click();
  await expect(page).toHaveURL(ADMIN_ROUTES.login);
  const old = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(old.status()).toBe(401);
  const renewed = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: "a brand new admin password" },
    headers: { origin: E2E_ORIGIN },
  });
  expect(renewed.status()).toBe(200);
});
