import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { like } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { authUser } from "@/db/schema";
import { seedJob } from "@/db/seed/content";
import { createAdmin } from "@/features/auth/createAdmin";
import { listRecordsForAdmin } from "@/lib/content/records";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

/**
 * The Jobs editor through the built app (R6.4, D92): the jobs by where they
 * stand and a job's editor, axe at both widths; and, once, the posting
 * closed at once, which a visitor sees, then opened again.
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
