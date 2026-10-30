import { expect, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { applications, authUser, enquiries } from "@/db/schema";
import { createAdmin } from "@/features/auth/createAdmin";
import { listRecordsForAdmin } from "@/lib/content/records";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";
import type { ServiceDocument } from "@/lib/validation";

import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { deleteMail, mailAttachments, waitForMail } from "@tests/support/mailpit";

/**
 * The critical journey (plan §34, R6.9), end to end in the built app: a
 * family taps WhatsApp from Home; an institution sends a quote; a nurse
 * applies with a CV, mail caught by Mailpit; the admin signs in, finds both
 * waiting on Today, edits a service, previews it, publishes it, and the
 * public page changes, the change recorded in Activity.
 */
const RUN = crypto.randomUUID().slice(0, 8);
const ADMIN = `critical-${RUN}@example.com`;
const ADMIN_NAME = `Critical ${RUN}`;
const INSTITUTION = `critical-school-${RUN}@example.com`;
const NURSE = `critical-nurse-${RUN}@example.com`;
const PASSWORD = "a long critical journey password";
const SERVICE = "Elderly care";
const CV = Buffer.from(`%PDF-1.7\n% The CV of Critical Nurse ${RUN}\n`);

test.afterAll(async () => {
  await getDb().delete(enquiries).where(eq(enquiries.email, INSTITUTION));
  await getDb().delete(applications).where(eq(applications.email, NURSE));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `critical-${RUN}%`));
  await closeDb();
});

test("a family, an institution and a nurse reach Al Hidaya, and the admin edits, previews and publishes a service", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the whole journey once is enough; each part runs at both widths");
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250) + 1}` });

  // A family, from Home: WhatsApp opens the company's chat with its words already written.
  await page.goto(ROUTES.home);
  await expect(page.getByRole("link", { name: UI_TEXT.whatsappButton })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/\d+\?text=.+/,
  );

  // An institution asks for a quote; the team's alert arrives.
  await page.goto(ROUTES.quoteFor("school-nurse-staffing"));
  await page.getByRole("textbox", { name: UI_TEXT.yourName, exact: true }).fill("Critical School");
  await page.getByRole("radio", { name: "A school" }).check();
  await page.getByRole("textbox", { name: UI_TEXT.phone, exact: true }).fill("4411 2233");
  await page.getByRole("textbox", { name: UI_TEXT.email, exact: true }).fill(INSTITUTION);
  await page.getByRole("radio", { name: "A phone call" }).check();
  await page.getByRole("textbox", { name: UI_TEXT.message, exact: true }).fill("Two nurses for the new term.");
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
  await expect(page.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);
  await page.getByRole("button", { name: UI_TEXT.sendQuote }).click();
  await expect(page.getByRole("group", { name: UI_TEXT.quoteSent })).toBeVisible();
  const [alert] = await waitForMail(`"${INSTITUTION}"`);
  await deleteMail([alert.ID]);

  // A nurse applies with a CV; HR's email arrives with it attached.
  await page.goto(ROUTES.applyGeneral);
  const field = (label: string) => page.getByRole("textbox", { name: label, exact: true });
  await field(UI_TEXT.fullName).fill("Critical Nurse");
  await field(UI_TEXT.email).fill(NURSE);
  await field(UI_TEXT.phone).fill("+63 917 123 4567");
  await page.getByRole("group", { name: UI_TEXT.whereNow }).getByRole("radio", { name: "Outside Qatar" }).check();
  await page.getByRole("group", { name: UI_TEXT.mophLicence }).getByRole("radio", { name: "Not yet" }).check();
  await page.getByRole("group", { name: UI_TEXT.dataflow }).getByRole("radio", { name: "Not yet" }).check();
  await page.getByRole("group", { name: UI_TEXT.prometric }).getByRole("radio", { name: "Passed" }).check();
  await field(UI_TEXT.experienceYears).fill("6");
  await page.getByLabel(UI_TEXT.cv).setInputFiles({ name: "Critical CV.pdf", mimeType: "application/pdf", buffer: CV });
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
  await expect(page.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);
  await page.getByRole("button", { name: UI_TEXT.sendApplication }).click();
  await expect(page.getByRole("group", { name: UI_TEXT.applicationSent })).toBeVisible();
  const [hr] = await waitForMail(`"${NURSE}"`);
  const [attached] = await mailAttachments(hr.ID);
  expect(Buffer.from(attached.bytes).equals(CV)).toBe(true);
  await deleteMail([hr.ID]);

  // The admin signs in, and both are waiting on Today.
  await createAdmin({ email: ADMIN, name: ADMIN_NAME, password: PASSWORD });
  await page.setExtraHTTPHeaders({});
  await page.goto(ADMIN_ROUTES.login);
  await page.getByRole("textbox", { name: ADMIN_TEXT.email }).fill(ADMIN);
  await page.getByLabel(ADMIN_TEXT.password, { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: ADMIN_TEXT.signIn }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.overview);
  await expect(page.getByRole("button", { name: new RegExp(ADMIN_TEXT.quoteFrom("Critical School")) })).toBeVisible();
  await expect(
    page.getByRole("button", { name: new RegExp(ADMIN_TEXT.applicationFrom("Critical Nurse")) }),
  ).toBeVisible();

  // A service edited, previewed, published; the public page changes.
  const [elderly] = (await listRecordsForAdmin<ServiceDocument>("SERVICES")).filter(
    (service) => service.draft.name.en === SERVICE,
  );
  const original = elderly.draft;
  const summary = `Nursing care at home for older people, every day of the week (${RUN}).`;
  const visitor = await browser.newPage();
  try {
    await page.goto(ADMIN_ROUTES.services);
    await page.getByRole("link", { name: new RegExp(`^${SERVICE}`) }).click();
    await expect(page.getByRole("heading", { level: 1, name: SERVICE })).toBeVisible();
    await page.getByRole("textbox", { name: ADMIN_TEXT.summary }).fill(summary);
    const bar = page.locator("form").filter({ has: page.getByRole("heading", { level: 1 }) });
    await bar.getByRole("button", { name: ADMIN_TEXT.saveDraft }).click();
    await expect(bar.getByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();

    const [preview] = await Promise.all([
      page.waitForEvent("popup"),
      bar.getByRole("link", { name: ADMIN_TEXT.preview }).click(),
    ]);
    await expect(preview).toHaveURL(ROUTES.service(original.slug));
    await expect(preview.getByText(summary).first()).toBeVisible();
    await expect(preview.getByRole("status").filter({ hasText: UI_TEXT.previewBar })).toBeVisible();
    await preview.close();
    await visitor.goto(ROUTES.service(original.slug));
    await expect(visitor.getByText(original.summary.en).first()).toBeVisible();
    await expect(visitor.getByText(summary)).toHaveCount(0);

    await bar.getByRole("button", { name: ADMIN_TEXT.publish }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(SERVICE) })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(SERVICE))).toBeVisible();
    await visitor.reload();
    await expect(visitor.getByText(summary).first()).toBeVisible();

    // Recorded in Activity, by the admin's name.
    await page.goto(`${ADMIN_ROUTES.activity}?kind=CONTENT`);
    const published = page
      .getByRole("article")
      .filter({ hasText: ADMIN_TEXT.didPublish(ADMIN_TEXT.theRecord.SERVICES(SERVICE)) })
      .first();
    await expect(published).toContainText(ADMIN_NAME);
  } finally {
    // Back as it was, through the app, so its cache drops the edit too.
    const headers = { origin: E2E_ORIGIN };
    await page.request.put(ADMIN_API_ROUTES.adminService(elderly.id), { data: original, headers });
    await page.request.post(ADMIN_API_ROUTES.adminServicePublish(elderly.id), { headers });
    await visitor.close();
  }
  await page.goto(ROUTES.service(original.slug));
  await expect(page.getByText(original.summary.en).first()).toBeVisible();
});
