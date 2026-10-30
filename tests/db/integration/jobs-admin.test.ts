import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { closeDb, getDb } from "@/db/client";
import { auditLog, records } from "@/db/schema";
import {
  createJob,
  discardJobDraft,
  findJobToApply,
  getJobForAdmin,
  listJobsForAdmin,
  listPublishedJobs,
  publishJob,
  saveJobDraft,
  setJobArchived,
  setJobClosed,
} from "@/features/careers/api";
import { createRecord, saveRecordDraft } from "@/lib/content/records";
import { jobFixture } from "@tests/support/fixtures/content";

const REQUEST = `req_jobs_admin_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const AT = new Date("2026-10-30T09:00:00Z");

const tags = () => vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag);

beforeAll(async () => {
  await getDb().delete(records);
});
beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
});

afterAll(async () => {
  await getDb().delete(records);
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await closeDb();
});

describe("the admin's jobs, against the local MySQL (D92)", () => {
  let nurse = "";
  let school = "";

  it("make a job as a draft, open until closed whatever the request says, newest posting first", async () => {
    nurse = (await createJob(jobFixture({ slug: "registered-nurse", postedOn: "2026-10-01", closed: true }), actor)).id;
    school = (await createJob(jobFixture({ slug: "school-nurse", postedOn: "2026-10-20" }), actor)).id;
    const jobs = await listJobsForAdmin(AT);
    expect(jobs.map((job) => [job.id, job.publishedAt, job.open])).toEqual([
      [school, null, false],
      [nurse, null, false],
    ]);
    expect((await getJobForAdmin(nurse)).draft.closed).toBe(false);
  });

  it("publish a job, which then takes applications, and move its address", async () => {
    expect(await publishJob(nurse, actor)).toMatchObject({ open: true, unpublishedChanges: false });
    expect(tags()).toEqual(expect.arrayContaining(["jobs", "job:registered-nurse"]));
    await saveJobDraft(nurse, jobFixture({ slug: "registered-general-nurse", postedOn: "2026-10-01" }), actor);
    vi.mocked(revalidateTag).mockClear();
    await publishJob(nurse, actor);
    expect(tags()).toEqual(expect.arrayContaining(["job:registered-nurse", "job:registered-general-nurse"]));
  });

  it("close a published job at once and open it again, on both copies, nothing else of the draft going live", async () => {
    await saveJobDraft(nurse, jobFixture({ slug: "registered-general-nurse", title: { en: "A new title" } }), actor);
    vi.mocked(revalidateTag).mockClear();
    const closed = await setJobClosed(nurse, true, actor);
    expect(closed).toMatchObject({ open: false, draft: { closed: true, title: { en: "A new title" } } });
    expect(tags()).toEqual(expect.arrayContaining(["jobs", "job:registered-general-nurse"]));
    const [live] = await listPublishedJobs(AT);
    expect(live).toMatchObject({ open: false, published: { closed: true } });
    expect(live.published.title.en).not.toBe("A new title");
    expect(await findJobToApply("registered-general-nurse", "published", AT)).toMatchObject({ open: false });

    // A save from the editor keeps it closed: only Reopen opens it.
    await saveJobDraft(nurse, { ...jobFixture({ slug: "registered-general-nurse" }), closed: false }, actor);
    await publishJob(nurse, actor);
    expect((await listJobsForAdmin(AT)).find((job) => job.id === nurse)?.open).toBe(false);

    expect(await setJobClosed(nurse, false, actor)).toMatchObject({ open: true, draft: { closed: false } });
    expect((await listPublishedJobs(AT))[0].open).toBe(true);
  });

  it("refuse to close a job never published, and to publish a draft its checks refuse", async () => {
    await expect(setJobClosed(school, true, actor)).rejects.toMatchObject({ code: "NOTHING_PUBLISHED" });
    await saveRecordDraft("JOBS", school, { ...jobFixture(), slug: "apply" }, actor);
    await expect(publishJob(school, actor)).rejects.toBeInstanceOf(ZodError);
    await expect(discardJobDraft(school, actor)).rejects.toMatchObject({ code: "NOTHING_PUBLISHED" });
    expect(await discardJobDraft(nurse, actor)).toMatchObject({ unpublishedChanges: false });
  });

  it("keep a job saved before Close now existed open when the editor saves it", async () => {
    const before: Partial<ReturnType<typeof jobFixture>> = jobFixture({ slug: "older-posting" });
    delete before.closed;
    const older = await createRecord("JOBS", before, actor);
    expect((await saveJobDraft(older, jobFixture({ slug: "older-posting" }), actor)).draft.closed).toBe(false);
    await getDb().delete(records).where(eq(records.id, older));
  });

  it("take a job off the site and put it back", async () => {
    const archived = await setJobArchived(nurse, true, actor);
    expect(archived.archivedAt).toEqual(expect.any(Date));
    expect(tags()).toEqual(expect.arrayContaining(["jobs", "job:registered-general-nurse"]));
    expect(await listPublishedJobs(AT)).toEqual([]);
    expect((await setJobArchived(nurse, false, actor)).archivedAt).toBeNull();
    expect(await listPublishedJobs(AT)).toHaveLength(1);
  });

  it("record each change, closing as a status change, in the audit trail", async () => {
    const rows = await getDb()
      .select({ action: auditLog.action, changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.requestId, REQUEST));
    expect(rows.map((row) => row.action)).toEqual(
      expect.arrayContaining(["CREATE", "UPDATE", "PUBLISH", "STATUS_CHANGE", "ARCHIVE", "DISCARD_DRAFT"]),
    );
    expect(rows.filter((row) => row.action === "STATUS_CHANGE").map((row) => row.changes)).toEqual(
      expect.arrayContaining([{ closed: { from: false, to: true } }, { closed: { from: true, to: false } }]),
    );
  });
});
