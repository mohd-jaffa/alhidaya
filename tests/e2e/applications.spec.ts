import fs from "node:fs/promises";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { applications, records } from "@/db/schema";
import { seedJob } from "@/db/seed/content";
import { createRecord, publishRecord } from "@/lib/content/records";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";
import { deleteMail, mailAttachments, waitForMail } from "@tests/support/mailpit";

/**
 * The application form (plan §9.2, §9.3, R5.2, R5.4): from a job's Apply to
 * the thanks, with the CV kept in the private CV folder and attached to the
 * HR email; the general application
 * refusing a file that is not a PDF or Word file by its bytes, nothing typed
 * lost; a closed job's form sending the visitor to the job. Turnstile runs on
 * Cloudflare's test keys. Each journey is a visitor of its own (§10.3).
 */
const ACTOR = { adminId: null, requestId: "e2e-applications" };
const CLOSED = `closed-apply-${crypto.randomUUID().slice(0, 8)}`;
const JOB = seedJob("2026-10-01");

const PDF = Buffer.from("%PDF-1.7\n% Mariam's CV\n");
/** A Word document as its first bytes tell it: a zip holding word/document.xml. */
const DOCX = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("....word/document.xml....")]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

test.beforeAll(async () => {
  const id = await createRecord(
    "JOBS",
    { ...JOB, title: { en: "Clinic Nurse" }, slug: CLOSED, postedOn: "2026-09-01", closesOn: "2026-09-30" },
    ACTOR,
  );
  await publishRecord("JOBS", id, CLOSED, ACTOR);
});

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
});

test.afterAll(async () => {
  await getDb().delete(records).where(eq(records.slug, CLOSED));
  await closeDb();
});

const field = (page: Page, label: string) => page.getByRole("textbox", { name: label, exact: true });
const checked = (page: Page) => expect(page.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);

async function fill(page: Page, email: string) {
  await field(page, UI_TEXT.fullName).fill("Mariam Ali");
  await field(page, UI_TEXT.email).fill(email);
  await field(page, UI_TEXT.phone).fill("5551 2345");
  await page.getByRole("group", { name: UI_TEXT.whereNow }).getByRole("radio", { name: "Outside Qatar" }).check();
  await page.getByRole("group", { name: UI_TEXT.mophLicence }).getByRole("radio", { name: "In progress" }).check();
  await page.getByRole("group", { name: UI_TEXT.dataflow }).getByRole("radio", { name: "Done" }).check();
  await page.getByRole("group", { name: UI_TEXT.prometric }).getByRole("radio", { name: "Not yet" }).check();
  await field(page, UI_TEXT.experienceYears).fill("4");
  await page.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
}

const cv = (page: Page, name: string, buffer: Buffer, mimeType = "application/pdf") =>
  page.getByLabel(UI_TEXT.cv).setInputFiles({ name, mimeType, buffer });

const emailStatus = async (email: string) =>
  (
    await getDb().select({ status: applications.emailStatus }).from(applications).where(eq(applications.email, email))
  )[0]?.status;

/** What was kept of an application, found by its email, and its CV removed from the folder once read. */
async function kept(email: string) {
  const rows = await getDb()
    .select({
      jobId: applications.jobId,
      jobTitle: applications.jobTitle,
      cvKey: applications.cvKey,
      cvName: applications.cvName,
      cvType: applications.cvType,
      cvStatus: applications.cvStatus,
    })
    .from(applications)
    .where(eq(applications.email, email));
  for (const row of rows) {
    if (!row.cvKey) continue;
    const file = path.join(process.env.CV_DIR!, row.cvKey);
    expect((await fs.stat(file)).mode & 0o777).toBe(0o600);
    await fs.rm(file);
  }
  await getDb().delete(applications).where(eq(applications.email, email));
  return rows;
}

test("a job's Apply leads to its form, which shows each mistake, then takes the application and its CV", async ({
  page,
}) => {
  const email = `apply-${crypto.randomUUID()}@example.com`;
  await page.goto(ROUTES.job(JOB.slug));
  await page.getByRole("link", { name: UI_TEXT.applyForJob }).first().click();
  await expect(page).toHaveURL(ROUTES.applyForJob(JOB.slug));
  await expect(page).toHaveTitle(new RegExp(`^${UI_TEXT.applyFor(JOB.title.en)} · `));
  await expect(page.getByRole("heading", { level: 1, name: JOB.title.en })).toBeVisible();
  await expect(page.getByRole("link", { name: UI_TEXT.aboutJob })).toHaveAttribute("href", ROUTES.job(JOB.slug));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new RegExp(`${ROUTES.applyForJob(JOB.slug)}/opengraph-image`),
  );

  const form = page.locator("form");
  await form.getByRole("button", { name: UI_TEXT.sendApplication }).click();
  await expect(field(page, UI_TEXT.fullName)).toBeFocused();
  await expect(form.getByText(VALIDATION_MESSAGES.cvRequired)).toBeVisible();
  await expect(form.getByText(VALIDATION_MESSAGES.mophLicence)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await fill(page, email);
  await cv(page, "Mariam CV.pdf", PDF);
  await expect(form.getByText("Mariam CV.pdf")).toBeVisible();
  await expect(form.getByText(VALIDATION_MESSAGES.cvRequired)).toHaveCount(0);
  await checked(page);
  await form.getByRole("button", { name: UI_TEXT.sendApplication }).click();

  const thanks = page.getByRole("group", { name: UI_TEXT.applicationSent });
  await expect(thanks).toBeFocused();
  await expect(thanks).toContainText(UI_TEXT.applicationSentNext);
  await expect(thanks.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The HR email goes once the applicant has their answer (plan §9.3): Reply-To them, the CV attached.
  const [alert] = await waitForMail(`"${email}"`);
  expect(alert.Subject).toBe(`Application for ${JOB.title.en} from Mariam Ali`);
  expect(alert.ReplyTo.map((to) => to.Address)).toEqual([email]);
  const [attached] = await mailAttachments(alert.ID);
  expect(attached.FileName).toMatch(/_registered-general-nurse-home-care_mariam-ali_[0-9a-f]{10}\.pdf$/);
  expect(Buffer.from(attached.bytes).equals(PDF)).toBe(true);
  await expect.poll(() => emailStatus(email)).toBe("SENT");
  await deleteMail([alert.ID]);

  expect(await kept(email)).toEqual([
    {
      jobId: expect.any(String),
      jobTitle: JOB.title.en,
      cvKey: expect.stringMatching(/^\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}_registered-general-nurse-home-care_mariam-ali_/),
      cvName: "Mariam CV.pdf",
      cvType: "pdf",
      cvStatus: "STORED",
    },
  ]);
});

test("the general application refuses a file that is not a PDF or Word file by its bytes, keeping what was typed", async ({
  page,
}) => {
  const email = `general-${crypto.randomUUID()}@example.com`;
  await page.goto(ROUTES.applyGeneral);
  await expect(page.getByRole("heading", { level: 1, name: UI_TEXT.generalApplicationHeadline })).toBeVisible();
  await expect(page.getByText(UI_TEXT.generalApplicationFor)).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new RegExp(`${ROUTES.applyGeneral}/opengraph-image`),
  );

  await fill(page, email);
  for (const disguised of [PNG, Buffer.from("MZ harmless executable-signature fixture")]) {
    await cv(page, "cv.pdf", disguised);
    await checked(page);
    await page.getByRole("button", { name: UI_TEXT.sendApplication }).click();
    await expect(page.getByLabel(UI_TEXT.cv)).toHaveAccessibleDescription(
      new RegExp(VALIDATION_MESSAGES.cvType.replace(/[.()]/g, "\\$&")),
    );
    await expect(field(page, UI_TEXT.fullName)).toHaveValue("Mariam Ali");
    expect(await kept(email)).toEqual([]);
  }

  await cv(page, "Mariam CV.docx", DOCX, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  await checked(page);
  await page.getByRole("button", { name: UI_TEXT.sendApplication }).click();
  await expect(page.getByRole("group", { name: UI_TEXT.applicationSent })).toBeFocused();
  const [alert] = await waitForMail(`"${email}"`);
  expect(alert.Subject).toBe("General application from Mariam Ali");
  const [attached] = await mailAttachments(alert.ID);
  expect(attached).toMatchObject({
    FileName: expect.stringMatching(/_general_mariam-ali_[0-9a-f]{10}\.docx$/),
    ContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  await expect.poll(() => emailStatus(email)).toBe("SENT");
  await deleteMail([alert.ID]);
  expect(await kept(email)).toEqual([
    expect.objectContaining({ jobId: null, jobTitle: null, cvType: "docx", cvStatus: "STORED" }),
  ]);
});

test("a closed job's form sends the visitor to the job, and an unknown job's is not found", async ({ page }) => {
  await page.goto(ROUTES.applyForJob(CLOSED));
  await expect(page).toHaveURL(ROUTES.job(CLOSED));
  await expect(page.getByText(UI_TEXT.jobClosed)).toBeVisible();
  const missing = await page.goto(ROUTES.applyForJob("no-such-job"));
  expect(missing?.status()).toBe(404);
});
