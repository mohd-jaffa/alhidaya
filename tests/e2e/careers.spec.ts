import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { eq } from "drizzle-orm";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { closeDb, getDb } from "@/db/client";
import { records } from "@/db/schema";
import { seedJob, seedPages } from "@/db/seed/content";
import { createRecord, publishRecord } from "@/lib/content/records";

/**
 * Careers and a job's page through the built app (plan §6.5, §6.6, R5.1):
 * the open jobs and the general application, an open job with Apply and its
 * posting for search engines, a closed one that says so; axe at both widths.
 */
const ACTOR = { adminId: null, requestId: "e2e-careers" };
const CLOSED = `closed-nurse-${crypto.randomUUID().slice(0, 8)}`;
const JOB = seedJob("2026-10-01");

const careersHeadline = () => {
  const sign = seedPages().CAREERS.sections[0];
  if (sign.type !== "SIGN") throw new Error("a page opens with its sign");
  return sign.content.headline.en;
};

const structuredData = async (page: Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (text) => JSON.parse(text)["@type"] as string,
  );

test.beforeAll(async () => {
  const id = await createRecord(
    "JOBS",
    { ...JOB, title: { en: "Clinic Nurse" }, slug: CLOSED, postedOn: "2026-09-01", closesOn: "2026-09-30" },
    ACTOR,
  );
  await publishRecord("JOBS", id, CLOSED, ACTOR);
});

test.afterAll(async () => {
  await getDb().delete(records).where(eq(records.slug, CLOSED));
  await closeDb();
});

test("Careers lists the open jobs as cards, offers a general application, and passes axe", async ({ page }) => {
  await page.goto(ROUTES.careers);
  await expect(page).toHaveTitle(new RegExp(`^${PAGE_NAMES.CAREERS} · `));
  await expect(page.getByRole("heading", { level: 1, name: careersHeadline() })).toBeVisible();
  const jobs = page.getByRole("region", { name: UI_TEXT.openJobs });
  await expect(jobs.getByRole("link", { name: JOB.title.en })).toHaveAttribute("href", ROUTES.job(JOB.slug));
  await expect(jobs.getByRole("link", { name: "Clinic Nurse" })).toHaveCount(0);
  await expect(jobs.getByRole("link", { name: UI_TEXT.generalApplication })).toHaveAttribute(
    "href",
    ROUTES.applyGeneral,
  );
  await expect(page.getByRole("region", { name: "Before you apply" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("an open job shows in full under Careers' pill, with Apply and its posting for search engines", async ({
  page,
}) => {
  await page.goto(ROUTES.careers);
  await page.getByRole("region", { name: UI_TEXT.openJobs }).getByRole("link", { name: JOB.title.en }).click();
  await expect(page).toHaveURL(ROUTES.job(JOB.slug));
  await expect(page).toHaveTitle(new RegExp(`^${JOB.title.en} · `));

  const sign = page.locator("#start");
  await expect(sign.getByRole("heading", { level: 1, name: JOB.title.en })).toBeVisible();
  await expect(sign.getByRole("link", { name: UI_TEXT.applyForJob })).toHaveAttribute(
    "href",
    ROUTES.applyForJob(JOB.slug),
  );
  const about = page.getByRole("region", { name: UI_TEXT.aboutJob });
  await expect(about.getByRole("heading", { name: UI_TEXT.qualifications })).toBeVisible();
  await expect(about.getByText(JOB.qualifications[0].en)).toBeVisible();
  expect(await structuredData(page)).toContain("JobPosting");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a closed job stays reachable, says so, takes no application and stays out of search", async ({ page }) => {
  const answer = await page.goto(ROUTES.job(CLOSED));
  expect(answer?.status()).toBe(200);
  await expect(page.getByRole("status").filter({ hasText: UI_TEXT.jobClosed })).toBeVisible();
  await expect(page.getByRole("link", { name: UI_TEXT.applyForJob })).toHaveCount(0);
  await expect(page.locator("#start").getByRole("link", { name: UI_TEXT.generalApplication })).toBeVisible();
  const more = page.getByRole("region", { name: UI_TEXT.otherOpenJobs });
  await expect(more.getByRole("link", { name: JOB.title.en })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(await structuredData(page)).not.toContain("JobPosting");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const missing = await page.goto(ROUTES.job("no-such-job"));
  expect(missing?.status()).toBe(404);
});
