import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { FORM_RATE_LIMIT, UPLOAD_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import { closeDb, getDb } from "@/db/client";
import { applicationNotes, applications, auditLog, errorLog, rateLimits, records } from "@/db/schema";
import { type ApplicationSubmission, receiveApplication, submitApplication } from "@/features/careers/api";
import { createRecord, publishRecord, saveRecordDraft, setRecordArchived } from "@/lib/content/records";
import { applicationFormSchema } from "@/lib/validation";
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
  await getDb().delete(errorLog).where(eq(errorLog.message, "Application CV not stored"));
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

/** An application as the route parses it, with a CV of these bytes under this name. */
const received = (cv: { bytes: Uint8Array | string; name: string }, overrides: Record<string, unknown> = {}) =>
  applicationFormSchema.parse({
    jobId: "",
    name: "Mariam Ali",
    email: "Mariam@Example.com",
    phone: "5551 2345",
    whereNow: "OUTSIDE_QATAR",
    mophLicence: "IN_PROGRESS",
    dataflow: "DONE",
    prometric: "NOT_YET",
    experienceYears: "4",
    note: "",
    consent: true,
    turnstileToken: "token-from-cloudflare",
    cv: new File([cv.bytes as BlobPart], cv.name),
    ...overrides,
  });

const PDF = "%PDF-1.7 Mariam's CV";
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

describe("receiveApplication, against the local MySQL", () => {
  let root = "";
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-applications-"));
    vi.stubEnv("CV_DIR", path.join(root, "cvs"));
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await fs.rm(root, { recursive: true, force: true });
  });

  it("keeps each answer as the applicant saw it, and the CV in the private folder under a readable name", async () => {
    const { id, cvStatus } = await receiveApplication(received({ bytes: PDF, name: "Mariam CV.pdf" }), ip(), at);
    expect(cvStatus).toBe("STORED");
    const [row] = await getDb().select().from(applications).where(eq(applications.id, id));
    expect(row).toMatchObject({
      jobId: null,
      email: "mariam@example.com",
      phone: "+97455512345",
      cvName: "Mariam CV.pdf",
      cvType: "pdf",
      cvBytes: PDF.length,
      cvStatus: "STORED",
      emailStatus: "PENDING",
      fields: [
        { label: UI_TEXT.fullName, value: "Mariam Ali" },
        { label: UI_TEXT.email, value: "mariam@example.com" },
        { label: UI_TEXT.phone, value: "+974 5551 2345" },
        { label: UI_TEXT.whereNow, value: "Outside Qatar" },
        { label: UI_TEXT.mophLicence, value: "In progress" },
        { label: UI_TEXT.dataflow, value: "Done" },
        { label: UI_TEXT.prometric, value: "Not yet" },
        { label: UI_TEXT.experienceYears, value: "4" },
        { label: UI_TEXT.consent, value: UI_TEXT.consentGiven },
      ],
    });
    expect(row.cvKey).toMatch(/^2026-10\/2026-10-29_general_mariam-ali_[0-9a-f]{10}\.pdf$/);
    const file = path.join(root, "cvs", row.cvKey!);
    expect(await fs.readFile(file, "utf8")).toBe(PDF);
    expect((await fs.stat(file)).mode & 0o777).toBe(0o600);
  });

  it("names the CV by the job applied for, keeps the note, and tidies the name the CV was uploaded under", async () => {
    const application = received(
      { bytes: PDF, name: "C:\\fakepath\\My   CV.pdf" },
      { jobId: jobs.open, note: "ICU, from March." },
    );
    const { id } = await receiveApplication(application, ip(), at);
    const [row] = await getDb().select().from(applications).where(eq(applications.id, id));
    expect(row.cvName).toBe("My CV.pdf");
    expect(row.cvKey).toMatch(/_registered-general-nurse-home-care_mariam-ali_/);
    expect(row.fields).toContainEqual({ label: UI_TEXT.applicationNote, value: "ICU, from March." });

    const unnamed = await receiveApplication(received({ bytes: PDF, name: "" }), ip(), at);
    const [{ cvName }] = await getDb()
      .select({ cvName: applications.cvName })
      .from(applications)
      .where(eq(applications.id, unnamed.id));
    expect(cvName).toBe("cv");
  });

  it("refuses a CV that is not a PDF or Word file by its first bytes, whatever its name, keeping nothing", async () => {
    const before = (await getDb().select({ id: applications.id }).from(applications)).length;
    for (const bytes of [PNG, "plain words", ""]) {
      await expect(receiveApplication(received({ bytes, name: "cv.pdf" }), ip(), at)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
        details: [{ path: "cv", message: expect.any(String) }],
      });
    }
    expect(await getDb().select({ id: applications.id }).from(applications)).toHaveLength(before);
    await expect(fs.readdir(path.join(root, "cvs"))).rejects.toThrow();
  });

  it("keeps the application when its CV cannot be saved: marked not stored, logged without anything personal", async () => {
    await fs.writeFile(path.join(root, "not-a-folder"), "");
    vi.stubEnv("CV_DIR", path.join(root, "not-a-folder", "cvs"));
    const { id, cvStatus } = await receiveApplication(received({ bytes: PDF, name: "cv.pdf" }), ip(), at);
    expect(cvStatus).toBe("NOT_STORED");
    const [row] = await getDb().select().from(applications).where(eq(applications.id, id));
    expect(row).toMatchObject({ cvKey: null, cvStatus: "NOT_STORED", cvName: "cv.pdf" });
    const logged = await getDb()
      .select({ context: errorLog.context, detail: errorLog.detail, stack: errorLog.stack })
      .from(errorLog)
      .where(eq(errorLog.message, "Application CV not stored"));
    expect(logged.map((entry) => entry.context)).toContainEqual({ applicationId: id });
    expect(JSON.stringify(logged)).not.toContain("mariam");
  });
});
