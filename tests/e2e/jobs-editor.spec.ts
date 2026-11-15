import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq, like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { applications, authUser, records } from "@/db/schema";
import { seedJob } from "@/db/seed/content";
import { createAdmin } from "@/features/auth/createAdmin";
import { listRecordsForAdmin } from "@/lib/content/records";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";

import { E2E_ORIGIN } from "@tests/support/e2e-app";
import { deleteMail, searchMail } from "@tests/support/mailpit";

/**
 * The Jobs editor through the built app (R6.4, D92): the jobs by where they
 * stand and a job's editor, axe at both widths; and, once, the posting
 * closed at once, which a visitor sees, then opened again; and, once, a
 * job's own questions (D209) added, published, asked and kept.
 */
const PASSWORD = "a long jobs password";
const RUN = crypto.randomUUID().slice(0, 8);
const JOB = seedJob("2026-10-01");

test.afterAll(async () => {
  await getDb()
    .delete(authUser)
    .where(like(authUser.email, `jobs-${RUN}-%`));
  await closeDb();
});

async function signIn(page: Page) {
  const email = `jobs-${RUN}-${crypto.randomUUID().slice(0, 6)}@example.com`;
  await createAdmin({ email, name: "Fatima", password: PASSWORD });
  const answer = await page.request.post(ADMIN_API_ROUTES.adminSession, {
    data: { email, password: PASSWORD },
    headers: { origin: E2E_ORIGIN },
  });
  expect(answer.status()).toBe(200);
}

const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("Jobs lists the open posting, and its editor and a new job's pass axe", async ({ page }) => {
  await signIn(page);
  await page.goto(ADMIN_ROUTES.jobs);
  const open = page.getByRole("region", { name: ADMIN_TEXT.jobsOpen });
  await expect(open.getByRole("link", { name: new RegExp(JOB.title.en) })).toBeVisible();
  await axe(page);

  await open.getByRole("link", { name: new RegExp(JOB.title.en) }).click();
  await expect(page.getByRole("heading", { level: 1, name: JOB.title.en })).toBeVisible();
  await expect(page.getByRole("region", { name: ADMIN_TEXT.onTheSite })).toContainText(ADMIN_TEXT.takingApplications);
  await axe(page);

  await page.goto(ADMIN_ROUTES.newJob);
  await expect(page.getByRole("heading", { level: 1, name: ADMIN_TEXT.newJob })).toBeVisible();
  await axe(page);
});

test("Close now closes the posting at once for visitors, and Reopen opens it again (D92)", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "the posting is closed once");
  const [posting] = await listRecordsForAdmin("JOBS");
  await signIn(page);
  const visitor = await browser.newPage();
  try {
    await page.goto(ADMIN_ROUTES.job(posting.id));
    const site = page.getByRole("region", { name: ADMIN_TEXT.onTheSite });
    await site.getByRole("button", { name: ADMIN_TEXT.closeNow }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.closeTitle(JOB.title.en) })
      .getByRole("button", { name: ADMIN_TEXT.closeNow })
      .click();
    await expect(site).toContainText(ADMIN_TEXT.notTakingApplications);

    await visitor.goto(ROUTES.job(JOB.slug));
    await expect(visitor.getByRole("status").filter({ hasText: UI_TEXT.jobClosed })).toBeVisible();

    await site.getByRole("button", { name: ADMIN_TEXT.reopen }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.reopenTitle(JOB.title.en) })
      .getByRole("button", { name: ADMIN_TEXT.reopen })
      .click();
    await expect(site).toContainText(ADMIN_TEXT.takingApplications);
    await visitor.reload();
    await expect(visitor.getByRole("status").filter({ hasText: UI_TEXT.jobClosed })).toBeHidden();
  } finally {
    // Open again whatever happened, for the journeys that apply to it.
    await page.request.post(ADMIN_API_ROUTES.adminJobClose(posting.id), {
      data: { closed: false },
      headers: { origin: E2E_ORIGIN },
    });
    await visitor.close();
  }
});

test("a job's own questions are added in its editor, asked after the fixed ones, and kept answered (D209)", async ({
  page,
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one journey through the editor and the form is enough");
  const slug = `asks-${RUN}`;
  const applicant = `jobs-${RUN}-applicant@example.com`;
  await signIn(page);
  const created = await page.request.post(ADMIN_API_ROUTES.adminJobs, {
    data: { ...seedJob("2026-10-01"), title: { en: `Night nurse ${RUN}` }, slug },
    headers: { origin: E2E_ORIGIN },
  });
  const { id } = ((await created.json()) as { data: { id: string } }).data;
  const visiting = await browser.newContext();
  const visitor = await visiting.newPage();
  try {
    await page.goto(ADMIN_ROUTES.job(id));
    const group = page.getByRole("region", { name: ADMIN_TEXT.applicationQuestions });
    await group.getByRole("button", { name: ADMIN_TEXT.addQuestion }).click();
    const first = group.getByRole("group", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.question, 1) });
    await first.getByRole("textbox", { name: ADMIN_TEXT.question }).fill("Do you hold a BLS certificate?");
    await first.getByRole("textbox", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.choice, 1) }).fill("Yes");
    await first.getByRole("textbox", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.choice, 2) }).fill("No");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const name = `Night nurse ${RUN}`;
    await page.getByRole("button", { name: ADMIN_TEXT.publish, exact: true }).click();
    await page
      .getByRole("dialog", { name: ADMIN_TEXT.publishTitle(name) })
      .getByRole("button", { name: ADMIN_TEXT.publish })
      .click();
    await expect(page.getByText(ADMIN_TEXT.isPublished(name))).toBeVisible();

    // The nurse: asked after Prometric, refused until it is answered, then sent.
    await visitor.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250) + 1}` });
    await visitor.goto(ROUTES.applyForJob(slug));
    const legends = await visitor.locator("form fieldset > legend").allTextContents();
    expect(legends.slice(3, 5)).toEqual([UI_TEXT.prometric, "Do you hold a BLS certificate?"]);
    expect((await new AxeBuilder({ page: visitor }).analyze()).violations).toEqual([]);
    const field = (label: string) => visitor.getByRole("textbox", { name: label, exact: true });
    await field(UI_TEXT.fullName).fill("Questions Nurse");
    await field(UI_TEXT.email).fill(applicant);
    await field(UI_TEXT.phone).fill("5551 2345");
    await visitor.getByRole("group", { name: UI_TEXT.whereNow }).getByRole("radio", { name: "In Qatar" }).check();
    await visitor.getByRole("group", { name: UI_TEXT.mophLicence }).getByRole("radio", { name: "Not yet" }).check();
    await visitor.getByRole("group", { name: UI_TEXT.dataflow }).getByRole("radio", { name: "Not yet" }).check();
    await visitor.getByRole("group", { name: UI_TEXT.prometric }).getByRole("radio", { name: "Passed" }).check();
    await field(UI_TEXT.experienceYears).fill("3");
    await visitor.getByLabel(UI_TEXT.cv).setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7 questions"),
    });
    await visitor.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }).check();
    await expect(visitor.locator(`input[name="${TURNSTILE_FIELD}"]`)).toHaveValue(/.+/);
    await visitor.getByRole("button", { name: UI_TEXT.sendApplication }).click();
    const bls = visitor.getByRole("group", { name: "Do you hold a BLS certificate?" });
    await expect(bls.getByText(VALIDATION_MESSAGES.chooseAnswer)).toBeVisible();
    await bls.getByRole("radio", { name: "Yes" }).check();
    await visitor.getByRole("button", { name: UI_TEXT.sendApplication }).click();
    await expect(visitor.getByRole("group", { name: UI_TEXT.applicationSent })).toBeVisible();

    const [kept] = await getDb()
      .select({ fields: applications.fields })
      .from(applications)
      .where(eq(applications.email, applicant));
    const at = kept.fields.findIndex(({ label }) => label === UI_TEXT.prometric);
    expect(kept.fields[at + 1]).toEqual({ label: "Do you hold a BLS certificate?", value: "Yes" });
  } finally {
    await visiting.close();
    await getDb().delete(applications).where(eq(applications.email, applicant));
    await getDb().delete(records).where(eq(records.id, id));
    await deleteMail((await searchMail(`"${applicant}"`)).map((message) => message.ID));
  }
});
