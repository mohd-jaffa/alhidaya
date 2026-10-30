import fs from "node:fs/promises";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { and, eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UI_TEXT } from "@/constants/messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { applications, auditLog, authUser } from "@/db/schema";
import { seedJob } from "@/db/seed/content";
import { createAdmin } from "@/features/auth/createAdmin";
import { displayPhone } from "@/lib/contact";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";

import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { deleteMail, mailAttachments, mailText, waitForMail } from "@tests/support/mailpit";

/**
 * Phase 5 end to end (plan §9, R5.6): a nurse applies for a job with a CV;
 * HR's email arrives with the CV attached; the admin follows its link, signs
 * in, finds the application open, downloads the CV (recorded), moves it
 * along and deletes it once asked, its CV file with it.
 */
const RUN = crypto.randomUUID().slice(0, 8);
const ADMIN = `apply-journey-${RUN}@example.com`;
const APPLICANT = `apply-journey-applicant-${RUN}@example.com`;
const PASSWORD = "a long journey password";
const JOB = seedJob("2026-10-01");
const CV = Buffer.from(`%PDF-1.7\n% The CV of Journey Nurse ${RUN}\n`);

test.afterAll(async () => {
  await getDb().delete(applications).where(eq(applications.email, APPLICANT));
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `apply-journey-${RUN}%`));
  await closeDb();
});

test("an application reaches HR with its CV and is handled from the email's link, to its deletion", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one journey through mail and the admin is enough");
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250) + 1}` });

  // The nurse, from the job's Apply.
  await page.goto(ROUTES.job(JOB.slug));
  await page.getByRole("link", { name: UI_TEXT.applyForJob }).first().click();
  const field = (label: string) => page.getByRole("textbox", { name: label, exact: true });
  await field(UI_TEXT.fullName).fill("Journey Nurse");
  await field(UI_TEXT.email).fill(APPLICANT);
  await field(UI_TEXT.phone).fill("+63 917 123 4567");
  await page.getByRole("group", { name: UI_TEXT.whereNow }).getByRole("radio", { name: "Outside Qatar" }).check();
  await page.getByRole("group", { name: UI_TEXT.mophLicence }).getByRole("radio", { name: "Not yet" }).check();
  await page.getByRole("group", { name: UI_TEXT.dataflow }).getByRole("radio", { name: "Not yet" }).check();
  await page.getByRole("group", { name: UI_TEXT.prometric }).getByRole("radio", { name: "Passed" }).check();
  await field(UI_TEXT.experienceYears).fill("6");
  await page.getByLabel(UI_TEXT.cv).setInputFiles({ name: "Journey CV.pdf", mimeType: "application/pdf", buffer: CV });
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
  await expect(page.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);
  await page.getByRole("button", { name: UI_TEXT.sendApplication }).click();
  await expect(page.getByRole("group", { name: UI_TEXT.applicationSent })).toBeVisible();

  // HR's email: the CV attached, and the link to the inbox.
  const [alert] = await waitForMail(`"${APPLICANT}"`);
  const [attached] = await mailAttachments(alert.ID);
  expect(Buffer.from(attached.bytes).equals(CV)).toBe(true);
  const link = (await mailText(alert.ID)).match(new RegExp(`${E2E_ORIGIN}/admin/applications/[0-9a-f-]+`))?.[0];
  expect(link).toBeDefined();
  await deleteMail([alert.ID]);

  // The admin follows it, signs in, and lands on the application, open.
  await createAdmin({ email: ADMIN, name: "Journey", password: PASSWORD });
  await page.setExtraHTTPHeaders({});
  await page.goto(link as string);
  await expect(page).toHaveURL(new RegExp(`${ADMIN_ROUTES.login}\\?next=`));
  await page.getByRole("textbox", { name: ADMIN_TEXT.email }).fill(ADMIN);
  await page.getByLabel(ADMIN_TEXT.password, { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: ADMIN_TEXT.signIn }).click();
  await expect(page).toHaveURL(link as string);

  const row = page.getByRole("button", { name: new RegExp(ADMIN_TEXT.applicationFrom("Journey Nurse")) });
  await expect(row).toHaveAttribute("aria-expanded", "true");
  await expect(row).toContainText(JOB.title.en);
  await expect(page.getByText(displayPhone("+639171234567"))).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The CV, downloaded under its kept name, and the download recorded.
  const [{ id, cvKey }] = await getDb()
    .select({ id: applications.id, cvKey: applications.cvKey })
    .from(applications)
    .where(eq(applications.email, APPLICANT));
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: ADMIN_TEXT.downloadCv }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(cvKey!.split("/")[1]);
  expect((await fs.readFile((await download.path()) as string)).equals(CV)).toBe(true);
  await expect
    .poll(
      async () =>
        (
          await getDb()
            .select({ id: auditLog.id })
            .from(auditLog)
            .where(and(eq(auditLog.entityId, id), eq(auditLog.action, "CV_DOWNLOAD")))
        ).length,
    )
    .toBe(1);

  // Moved along, then deleted once asked: the inbox takes its place, and the CV file is gone.
  await page.getByRole("button", { name: "Shortlisted", exact: true }).click();
  await expect(row).toContainText("Shortlisted");
  await page.getByRole("button", { name: ADMIN_TEXT.delete, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: ADMIN_TEXT.deleteApplicationTitle("Journey Nurse") });
  await dialog.getByRole("button", { name: ADMIN_TEXT.delete, exact: true }).click();
  await expect(page).toHaveURL(ADMIN_ROUTES.applications);
  expect(await getDb().select({ id: applications.id }).from(applications).where(eq(applications.id, id))).toEqual([]);
  await expect(fs.stat(path.join(process.env.CV_DIR!, cvKey!))).rejects.toThrow();
});
