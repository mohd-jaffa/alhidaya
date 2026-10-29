import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FORM_RATE_LIMIT, UPLOAD_LIMITS } from "@/constants/limits";
import { closeDb, getDb } from "@/db/client";
import { applicationNotes, applications, auditLog, rateLimits, records } from "@/db/schema";
import { type ApplicationSubmission, submitApplication } from "@/features/careers/api";
import { createRecord, publishRecord, saveRecordDraft, setRecordArchived } from "@/lib/content/records";
import { jobFixture, serviceFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_applications_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
/** A visitor of its own for each test, so no two share a rate limit. */
const ip = () => `visitor-${crypto.randomUUID()}`;
// 20:30 UTC is 23:30 in Doha on 29 October.
const at = new Date("2026-10-29T20:30:00Z");

const application = (overrides: Partial<ApplicationSubmission> = {}): ApplicationSubmission => ({
  jobId: null,
  name: "Mariam Ali",
  email: "mariam@example.com",
  phone: "+97455512345",
  fields: [{ label: "Years of nursing experience", value: "4" }],
  cv: { name: "Mariam CV.pdf", type: "pdf", bytes: 120_000 },
  ...overrides,
});

async function job(closesOn: string | null, slug: string) {
  const id = await createRecord("JOBS", jobFixture({ slug, closesOn }), actor);
  await publishRecord("JOBS", id, slug, actor);
  return id;
}

const jobs: Record<string, string> = {};

beforeAll(async () => {
  await getDb().delete(applications);
  await getDb().delete(records);
  jobs.open = await job(null, "open");
  jobs.lastDay = await job("2026-10-29", "last-day");
  jobs.closed = await job("2026-10-28", "closed");
  jobs.archived = await job(null, "archived");
  await setRecordArchived("JOBS", jobs.archived, true, actor);
  jobs.draft = await createRecord("JOBS", jobFixture({ slug: "draft" }), actor);
  jobs.service = await createRecord("SERVICES", serviceFixture(), actor);
  await publishRecord("SERVICES", jobs.service, "a-service", actor);
});

afterAll(async () => {
  await getDb().delete(applications);
  await getDb().delete(rateLimits);
  await getDb().delete(records);
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("submitApplication, against the local MySQL", () => {
  it("stores a general application, new, its CV and email still to come", async () => {
    const { id, jobTitle } = await submitApplication(application(), ip(), at);
    expect(jobTitle).toBeNull();
    const [row] = await getDb().select().from(applications).where(eq(applications.id, id));
    expect(row).toMatchObject({
      jobId: null,
      jobTitle: null,
      status: "NEW",
      cvKey: null,
      cvName: "Mariam CV.pdf",
      cvType: "pdf",
      cvBytes: 120_000,
      cvStatus: "PENDING",
      emailStatus: "PENDING",
      fields: application().fields,
    });
  });

  it("keeps the title of the job as published, not as the admin is editing it", async () => {
    await saveRecordDraft("JOBS", jobs.open, jobFixture({ title: { en: "A new title" } }), actor);
    const { id, jobTitle } = await submitApplication(application({ jobId: jobs.open }), ip(), at);
    expect(jobTitle).toBe(jobFixture().title.en);
    const [row] = await getDb().select().from(applications).where(eq(applications.id, id));
    expect(row).toMatchObject({ jobId: jobs.open, jobTitle: jobFixture().title.en });
  });

  it("takes applications until the end of the closing day in Doha", async () => {
    await expect(submitApplication(application({ jobId: jobs.lastDay }), ip(), at)).resolves.toMatchObject({
      jobTitle: jobFixture().title.en,
    });
    const midnight = new Date("2026-10-29T21:00:00Z");
    await expect(submitApplication(application({ jobId: jobs.lastDay }), ip(), midnight)).rejects.toMatchObject({
      code: "JOB_CLOSED",
    });
  });

  it("refuses a job that is closed, archived, never published, unknown or not a job", async () => {
    for (const jobId of [jobs.closed, jobs.archived, jobs.draft, jobs.service, crypto.randomUUID()]) {
      await expect(submitApplication(application({ jobId }), ip(), at)).rejects.toMatchObject({
        code: "JOB_CLOSED",
        httpStatus: 422,
      });
    }
  });

  it("takes five from a visitor in ten minutes and refuses the sixth, not counting a refused job", async () => {
    const visitor = ip();
    await expect(submitApplication(application({ jobId: jobs.closed }), visitor, at)).rejects.toThrow();
    for (let count = 0; count < FORM_RATE_LIMIT.limit; count++) await submitApplication(application(), visitor, at);
    await expect(submitApplication(application(), visitor, at)).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });

  it("lets the database refuse a CV of another type, an empty one or one past the limit", async () => {
    for (const cv of [
      { name: "cv.exe", type: "jpeg" as const, bytes: 10 },
      { name: "cv.pdf", type: "pdf" as const, bytes: 0 },
      { name: "cv.pdf", type: "pdf" as const, bytes: UPLOAD_LIMITS.cvBytes + 1 },
    ]) {
      await expect(submitApplication(application({ cv }), ip(), at)).rejects.toThrow();
    }
  });

  it("deletes an application's notes with it", async () => {
    const { id } = await submitApplication(application(), ip(), at);
    await getDb().insert(applicationNotes).values({ applicationId: id, body: "Shortlist." });
    await getDb().delete(applications).where(eq(applications.id, id));
    expect(await getDb().select().from(applicationNotes).where(eq(applicationNotes.applicationId, id))).toEqual([]);
  });
});
