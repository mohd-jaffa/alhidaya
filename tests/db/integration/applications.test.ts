import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { and, eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { FORM_RATE_LIMIT, INBOX_PAGE_SIZE, UPLOAD_LIMITS } from "@/constants/limits";
import { MAIL_TEXT, UI_TEXT } from "@/constants/messages";
import { closeDb, getDb } from "@/db/client";
import { applicationNotes, applications, auditLog, authUser, errorLog, rateLimits, records } from "@/db/schema";
import {
  addApplicationNote,
  type ApplicationSubmission,
  deleteApplication,
  downloadApplicationCv,
  getApplication,
  listApplications,
  receiveApplication,
  retryApplicationAlert,
  sendApplicationAlert,
  setApplicationStatus,
  submitApplication,
} from "@/features/careers/api";
import { getOperations } from "@/lib/content/operations";
import { createRecord, publishRecord, saveRecordDraft, setRecordArchived } from "@/lib/content/records";
import { applicationFormSchema } from "@/lib/validation";
import { jobFixture, serviceFixture } from "@tests/support/fixtures/content";
import { deleteMail, mailAttachments, mailText, searchMail, waitForMail } from "@tests/support/mailpit";

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
  await getDb().delete(errorLog).where(eq(errorLog.message, "Application alert email not sent"));
  await getDb().delete(errorLog).where(eq(errorLog.message, "Application CV not read"));
  await deleteMail((await searchMail(`subject:"${ALERT_NAME}"`)).map((message) => message.ID));
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
/** A name of its own, so this file's emails are found in Mailpit and nobody else's. */
const ALERT_NAME = `Applicant ${crypto.randomUUID().slice(0, 8)}`;
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

describe("the HR email, through Mailpit (plan §9.3, §17)", () => {
  let root = "";
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-alerts-"));
    vi.stubEnv("CV_DIR", path.join(root, "cvs"));
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await fs.rm(root, { recursive: true, force: true });
  });

  /** An application from this file's applicant, its CV kept in this test's folder. */
  const apply = (overrides: Record<string, unknown> = {}) =>
    receiveApplication(received({ bytes: PDF, name: "Mariam CV.pdf" }, { name: ALERT_NAME, ...overrides }), ip(), at);

  const row = async (id: string) =>
    (
      await getDb()
        .select({ emailStatus: applications.emailStatus, cvKey: applications.cvKey })
        .from(applications)
        .where(eq(applications.id, id))
    )[0];

  /** The one email about this application, found by its link to the inbox. */
  async function alertFor(id: string) {
    const found = await waitForMail(`subject:"${ALERT_NAME}"`, 1);
    for (const message of found) {
      const text = (await mailText(message.ID)).replaceAll("\r\n", "\n");
      if (text.includes(`/admin/applications/${id}`)) return { message, text };
    }
    throw new Error("no email for this application");
  }

  it("goes to the applications recipients, answered straight to the applicant, with every answer and the CV attached", async () => {
    const { id, cv } = await apply({ jobId: jobs.open });
    expect((await row(id)).emailStatus).toBe("PENDING");
    expect(await sendApplicationAlert(id, cv)).toBe("SENT");
    const { emailStatus, cvKey } = await row(id);
    expect(emailStatus).toBe("SENT");

    const { message, text } = await alertFor(id);
    expect(message.Subject).toBe(`Application for ${jobFixture().title.en} from ${ALERT_NAME}`);
    const { applicationsTo } = await getOperations();
    expect(message.To.map((to) => to.Address)).toEqual(applicationsTo);
    expect(message.ReplyTo).toEqual([expect.objectContaining({ Address: "mariam@example.com" })]);
    expect(text).toContain(`${UI_TEXT.mophLicence}:\nIn progress`);
    const [attachment] = await mailAttachments(message.ID);
    expect(attachment).toMatchObject({ FileName: cvKey!.split("/")[1], ContentType: "application/pdf" });
    expect(new TextDecoder().decode(attachment.bytes)).toBe(PDF);
  });

  it("is sent again by the admin's Retry with the kept CV, recorded, and never twice once it went", async () => {
    const { id } = await apply();
    await getDb().update(applications).set({ emailStatus: "NOT_SENT" }).where(eq(applications.id, id));
    expect(await retryApplicationAlert(id, actor)).toBe("SENT");
    expect((await row(id)).emailStatus).toBe("SENT");
    const [entry] = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.entityId, id));
    expect(entry).toEqual({ action: "UPDATE", changes: { emailStatus: { from: "NOT_SENT", to: "SENT" } } });
    const { message, text } = await alertFor(id);
    expect(message.Subject).toBe(`General application from ${ALERT_NAME}`);
    expect(text).toContain(MAIL_TEXT.applicationAlert.cvAttached((await row(id)).cvKey!.split("/")[1]));
    expect(await mailAttachments(message.ID)).toHaveLength(1);

    await expect(retryApplicationAlert(id, actor)).rejects.toMatchObject({
      code: "EMAIL_ALREADY_SENT",
      httpStatus: 422,
    });
  });

  it("says the CV is not attached when it was never kept, or when the kept file cannot be read (logged)", async () => {
    const unkept = await apply();
    await getDb()
      .update(applications)
      .set({ cvKey: null, cvStatus: "NOT_STORED" })
      .where(eq(applications.id, unkept.id));
    expect(await sendApplicationAlert(unkept.id)).toBe("SENT");
    const first = await alertFor(unkept.id);
    expect(first.text).toContain(MAIL_TEXT.applicationAlert.cvNotAttached);
    expect(await mailAttachments(first.message.ID)).toEqual([]);

    const lost = await apply();
    await fs.rm(path.join(root, "cvs", (await row(lost.id)).cvKey!));
    expect(await sendApplicationAlert(lost.id)).toBe("SENT");
    expect((await alertFor(lost.id)).text).toContain(MAIL_TEXT.applicationAlert.cvNotAttached);
    const logged = await getDb()
      .select({ context: errorLog.context })
      .from(errorLog)
      .where(eq(errorLog.message, "Application CV not read"));
    expect(logged.map((entry) => entry.context)).toContainEqual({ applicationId: lost.id });
  });

  it("keeps the application when the mail server cannot be reached: marked not sent, logged without anything personal", async () => {
    const { id, cv } = await apply();
    vi.stubEnv("SMTP_PORT", "9");
    expect(await sendApplicationAlert(id, cv)).toBe("NOT_SENT");
    expect((await row(id)).emailStatus).toBe("NOT_SENT");
    const logged = await getDb()
      .select({ context: errorLog.context, detail: errorLog.detail, stack: errorLog.stack })
      .from(errorLog)
      .where(eq(errorLog.message, "Application alert email not sent"));
    expect(logged.map((entry) => entry.context)).toContainEqual({ applicationId: id });
    expect(JSON.stringify(logged)).not.toContain("mariam@example.com");
    expect(JSON.stringify(logged)).not.toContain(ALERT_NAME);
  });

  it("answers not found for an application that is gone", async () => {
    const gone = crypto.randomUUID();
    await expect(sendApplicationAlert(gone)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(retryApplicationAlert(gone, actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
});

describe("the applications inbox, against the local MySQL (plan §9.5)", () => {
  let root = "";
  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-inbox-"));
    vi.stubEnv("CV_DIR", path.join(root, "cvs"));
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await fs.rm(root, { recursive: true, force: true });
  });

  /** An inbox of its own: the table emptied, then these applications, a minute apart, oldest first. */
  async function inbox(...entries: Partial<ApplicationSubmission>[]) {
    await getDb().delete(applications);
    const ids: string[] = [];
    for (const [index, entry] of entries.entries()) {
      const { id } = await submitApplication(application(entry), ip(), new Date(at.getTime() + index * 60_000));
      ids.push(id);
    }
    return ids;
  }

  const all = { needsYou: false, q: null, page: 1 } as const;
  const ids = (list: { items: { id: string }[] }) => list.items.map((item) => item.id);

  it("lists newest first, by job or the general ones, with how many in all and the jobs it can be filtered by", async () => {
    const [general, forOpen, forLastDay] = await inbox({}, { jobId: jobs.open }, { jobId: jobs.lastDay });
    const list = await listApplications(all);
    expect(ids(list)).toEqual([forLastDay, forOpen, general]);
    expect(list).toMatchObject({ total: 3, page: 1, pageSize: INBOX_PAGE_SIZE });
    expect(list.items[2]).toEqual({
      id: general,
      jobId: null,
      jobTitle: null,
      status: "NEW",
      emailStatus: "PENDING",
      cvStatus: "PENDING",
      name: "Mariam Ali",
      email: "mariam@example.com",
      phone: "+97455512345",
      createdAt: at,
    });
    expect(list.jobs).toEqual([
      { id: jobs.lastDay, title: jobFixture().title.en },
      { id: jobs.open, title: jobFixture().title.en },
    ]);
    expect(ids(await listApplications({ ...all, job: jobs.open }))).toEqual([forOpen]);
    expect(ids(await listApplications({ ...all, job: "general" }))).toEqual([general]);
  });

  it("filters by status, by what needs the admin, and by a name, an email or a phone as typed", async () => {
    const [first, second, third] = await inbox(
      { name: "Omar Haddad", email: "omar@example.com", phone: "+447946095800" },
      {},
      {},
    );
    await setApplicationStatus(first, "SHORTLISTED", actor);
    await setApplicationStatus(second, "IN_REVIEW", actor);
    await getDb().update(applications).set({ emailStatus: "SENT" }).where(eq(applications.id, third));
    await getDb().update(applications).set({ emailStatus: "NOT_SENT" }).where(eq(applications.id, second));
    expect(ids(await listApplications({ ...all, status: "SHORTLISTED" }))).toEqual([first]);
    // New, or its HR email not sent.
    expect(ids(await listApplications({ ...all, needsYou: true }))).toEqual([third, second]);
    expect(ids(await listApplications({ ...all, q: "omar" }))).toEqual([first]);
    expect(ids(await listApplications({ ...all, q: "7946 0958" }))).toEqual([first]);
    expect(ids(await listApplications({ ...all, q: "nobody" }))).toEqual([]);
  });

  it("names a job renamed between applications once, by the title it was last applied for under", async () => {
    await inbox({ jobId: jobs.open });
    await getDb().update(applications).set({ jobTitle: "An old title" });
    const later = new Date(at.getTime() + 60_000);
    await submitApplication(application({ jobId: jobs.open }), ip(), later);
    expect((await listApplications(all)).jobs).toEqual([{ id: jobs.open, title: jobFixture().title.en }]);
  });

  it("opens an application with every answer, its CV as uploaded, and its notes oldest first, each by its admin", async () => {
    const [id] = await inbox({ jobId: jobs.open });
    const admin = crypto.randomUUID();
    await getDb()
      .insert(authUser)
      .values({ id: admin, name: "Fatima (admin)", email: `inbox-${admin}@alhidaya.qa`, emailVerified: true });
    try {
      const first = await addApplicationNote(id, "Strong ICU experience.", { adminId: admin, requestId: REQUEST });
      expect(first).toEqual({
        id: expect.any(String),
        body: "Strong ICU experience.",
        author: "Fatima (admin)",
        createdAt: expect.any(Date),
      });
      await addApplicationNote(id, "Call on Sunday.", actor);
      const opened = await getApplication(id);
      expect(opened).toMatchObject({
        id,
        jobId: jobs.open,
        jobTitle: jobFixture().title.en,
        fields: application().fields,
        cvName: "Mariam CV.pdf",
        cvType: "pdf",
        cvBytes: 120_000,
      });
      expect(opened.notes.map((note) => [note.body, note.author])).toEqual([
        ["Strong ICU experience.", "Fatima (admin)"],
        ["Call on Sunday.", null],
      ]);
      const entries = await getDb()
        .select({ action: auditLog.action, changes: auditLog.changes })
        .from(auditLog)
        .where(eq(auditLog.entityId, id));
      expect(entries).toEqual([
        { action: "NOTE_ADD", changes: null },
        { action: "NOTE_ADD", changes: null },
      ]);
    } finally {
      await getDb().delete(authUser).where(eq(authUser.id, admin));
    }
  });

  it("moves an application along, recorded from and to, and records nothing when nothing changes", async () => {
    const [id] = await inbox({});
    await setApplicationStatus(id, "IN_REVIEW", actor);
    await setApplicationStatus(id, "IN_REVIEW", actor);
    expect((await getApplication(id)).status).toBe("IN_REVIEW");
    const entries = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.entityId, id));
    expect(entries).toEqual([{ action: "STATUS_CHANGE", changes: { status: { from: "NEW", to: "IN_REVIEW" } } }]);
  });

  it("gives the admin a kept CV under its kept name, recording each download, and refuses one not kept", async () => {
    await getDb().delete(applications);
    const { id } = await receiveApplication(received({ bytes: PDF, name: "Mariam CV.pdf" }), ip(), at);
    const { cvKey } = (await getDb().select({ cvKey: applications.cvKey }).from(applications))[0];
    const cv = await downloadApplicationCv(id, actor);
    expect(new TextDecoder().decode(cv.bytes)).toBe(PDF);
    expect(cv).toMatchObject({ filename: cvKey!.split("/")[1], contentType: "application/pdf" });
    const downloads = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes })
      .from(auditLog)
      .where(and(eq(auditLog.entityId, id), eq(auditLog.action, "CV_DOWNLOAD")));
    expect(downloads).toEqual([{ action: "CV_DOWNLOAD", changes: null }]);

    await getDb().update(applications).set({ cvStatus: "EXPIRED" }).where(eq(applications.id, id));
    await expect(downloadApplicationCv(id, actor)).rejects.toMatchObject({ code: "CV_NOT_KEPT", httpStatus: 404 });
    await getDb().update(applications).set({ cvStatus: "STORED" }).where(eq(applications.id, id));
    await fs.rm(path.join(root, "cvs", cvKey!));
    await expect(downloadApplicationCv(id, actor)).rejects.toMatchObject({ code: "CV_NOT_KEPT" });
  });

  it("deletes an application, its notes and its CV file at once, recorded without anything it held (D82)", async () => {
    await getDb().delete(applications);
    const { id } = await receiveApplication(received({ bytes: PDF, name: "Mariam CV.pdf" }), ip(), at);
    const unkept = (await submitApplication(application(), ip(), at)).id;
    const { cvKey } = (
      await getDb().select({ cvKey: applications.cvKey }).from(applications).where(eq(applications.id, id))
    )[0];
    await addApplicationNote(id, "Shortlist.", actor);

    await deleteApplication(id, actor);
    await expect(getApplication(id)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    expect(await getDb().select().from(applicationNotes).where(eq(applicationNotes.applicationId, id))).toEqual([]);
    await expect(fs.stat(path.join(root, "cvs", cvKey!))).rejects.toThrow();
    const [entry] = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes, summary: auditLog.summary })
      .from(auditLog)
      .where(and(eq(auditLog.entityId, id), eq(auditLog.action, "DELETE")));
    expect(entry).toEqual({ action: "DELETE", changes: null, summary: null });

    // One whose CV was never kept goes all the same.
    await deleteApplication(unkept, actor);
    await expect(getApplication(unkept)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });

  it("keeps the database's last word on a note: one longer than its column is refused as invalid", async () => {
    const [id] = await inbox({});
    await expect(addApplicationNote(id, "x".repeat(2001), actor)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      httpStatus: 400,
    });
    expect((await getApplication(id)).notes).toEqual([]);
  });

  it("answers not found for an application that is gone, whatever is asked of it", async () => {
    const gone = crypto.randomUUID();
    await expect(getApplication(gone)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND", httpStatus: 404 });
    await expect(setApplicationStatus(gone, "CLOSED", actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(addApplicationNote(gone, "Note", actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(downloadApplicationCv(gone, actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
    await expect(deleteApplication(gone, actor)).rejects.toMatchObject({ code: "RECORD_NOT_FOUND" });
  });
});
