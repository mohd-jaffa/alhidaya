import fs from "node:fs/promises";
import path from "node:path";

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DISK_BUDGETS } from "@/constants/limits";
import { closeDb, getDb } from "@/db/client";
import { applicationNotes, applications, auditLog, enquiries, errorLog, rateLimits, siteOperations } from "@/db/schema";
import { addApplicationNote, submitApplication } from "@/features/careers/api";
import { submitEnquiry } from "@/features/enquiries/api";
import { getOperationsForAdmin, purgeExpired, saveOperations } from "@/features/settings/api";
import { DEFAULT_OPERATIONS } from "@/lib/content/operations";
import { getServerEnv } from "@/lib/env/server";
import { saveCv } from "@/lib/storage/cvs";

const REQUEST = `req_operations_${crypto.randomUUID()}`;
const actor = { adminId: null, requestId: REQUEST };
const NOW = new Date("2026-10-30T00:30:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
const ip = () => `purge-${crypto.randomUUID()}`;

const enquiry = (at: Date) =>
  submitEnquiry(
    {
      form: "CONTACT",
      name: "Omar Haddad",
      email: "omar@example.com",
      phone: "+97455512345",
      fields: [{ label: "Message", value: "A nurse at night?" }],
    },
    ip(),
    at,
  );

/** An application received `days` ago, its CV kept in the CV folder, or under a key that will not delete. */
async function application(days: number, cv: "kept" | "stuck" | "none" = "kept") {
  const at = daysAgo(days);
  const { id } = await submitApplication(
    {
      jobId: null,
      name: "Mariam Ali",
      email: "mariam@example.com",
      phone: "+97455512345",
      fields: [{ label: "Years of nursing experience", value: "4" }],
      cv: { name: "cv.pdf", type: "pdf", bytes: 8 },
    },
    ip(),
    at,
  );
  const cvKey =
    cv === "none"
      ? null
      : cv === "stuck"
        ? "not a key the app made"
        : await saveCv({
            bytes: new TextEncoder().encode("%PDF-1.7"),
            type: "pdf",
            jobTitle: null,
            applicantName: "Mariam Ali",
            receivedAt: at,
          });
  await getDb()
    .update(applications)
    .set({ cvKey, cvStatus: cv === "none" ? "NOT_STORED" : "STORED" })
    .where(eq(applications.id, id));
  return { id, cvKey };
}

const cvExists = (key: string) =>
  fs.access(path.join(getServerEnv().CV_DIR, key)).then(
    () => true,
    () => false,
  );
// What other suites leave in the shared test database: their rate-limit windows, and the journeys' clean-up runs.
const clear = async () => {
  await getDb().delete(enquiries);
  await getDb().delete(applications);
  await getDb().delete(siteOperations);
  await getDb().delete(rateLimits);
  await getDb().delete(auditLog).where(eq(auditLog.action, "RETENTION_PURGE"));
};

beforeAll(clear);

afterAll(async () => {
  for (const row of await getDb().select({ cvKey: applications.cvKey }).from(applications))
    if (row.cvKey?.endsWith(".pdf")) await fs.rm(path.join(getServerEnv().CV_DIR, row.cvKey), { force: true });
  await clear();
  await getDb().delete(rateLimits);
  await getDb().delete(errorLog).where(eq(errorLog.message, "CV file not deleted by the clean-up"));
  await getDb().delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await getDb().delete(auditLog).where(eq(auditLog.action, "RETENTION_PURGE"));
  await closeDb();
});

describe("how the site runs, against the local MySQL and the CV folder (plan §13, §18, D95)", () => {
  it("answers the defaults, each folder's use against its budget, and no clean-up yet", async () => {
    const view = await getOperationsForAdmin();
    expect(view.operations).toEqual(DEFAULT_OPERATIONS);
    expect(view.disk.media.budget).toBe(DISK_BUDGETS.mediaBytes);
    expect(view.disk.cvs).toEqual({ bytes: expect.any(Number), budget: DISK_BUDGETS.cvBytes });
    expect(view.lastPurge).toBeNull();
  });

  it("changes how long things are kept, at once, recording what changed", async () => {
    const next = { ...DEFAULT_OPERATIONS, retentionDays: 90, cvExpiryDays: 30 };
    expect((await saveOperations(next, actor)).operations).toEqual(next);
    const [row] = await getDb()
      .select({ changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.requestId, REQUEST));
    expect(row.changes).toEqual({ retentionDays: { from: 180, to: 90 }, cvExpiryDays: { from: 180, to: 30 } });
  });

  it("deletes what is past its time each night, keeping what is not, and counts it (plan §18)", async () => {
    await enquiry(daysAgo(91));
    await enquiry(daysAgo(89));
    const old = await application(91);
    await addApplicationNote(old.id, "Called on Sunday.", actor);
    const oldWithout = await application(95, "none");
    const stale = await application(31);
    const fresh = await application(29);
    const stuck = await application(40, "stuck");
    const stuckOld = await application(100, "stuck");
    await getDb()
      .insert(rateLimits)
      .values([
        { keyHash: "old-window", windowStart: daysAgo(2), count: 1 },
        { keyHash: "this-window", windowStart: NOW, count: 1 },
      ]);

    expect(await purgeExpired(NOW)).toEqual({ enquiries: 1, applications: 2, cvs: 1, filesNotDeleted: 2 });

    const left89 = await getDb().select({ createdAt: enquiries.createdAt }).from(enquiries);
    expect(left89).toEqual([{ createdAt: daysAgo(89) }]);
    const left = await getDb()
      .select({ id: applications.id, cvKey: applications.cvKey, cvStatus: applications.cvStatus })
      .from(applications);
    expect(left.map((row) => row.id).toSorted()).toEqual([stale.id, fresh.id, stuck.id, stuckOld.id].toSorted());
    expect(left.map((row) => row.id)).not.toContain(oldWithout.id);
    expect(await getDb().select().from(applicationNotes).where(eq(applicationNotes.applicationId, old.id))).toEqual([]);
    expect(await cvExists(old.cvKey!)).toBe(false);
    expect(left.find((row) => row.id === stale.id)).toEqual({ id: stale.id, cvKey: null, cvStatus: "EXPIRED" });
    expect(await cvExists(stale.cvKey!)).toBe(false);
    expect(left.find((row) => row.id === fresh.id)?.cvStatus).toBe("STORED");
    expect(await cvExists(fresh.cvKey!)).toBe(true);
    expect(left.find((row) => row.id === stuck.id)).toMatchObject({ cvKey: stuck.cvKey, cvStatus: "STORED" });
    expect((await getDb().select({ keyHash: rateLimits.keyHash }).from(rateLimits)).map((row) => row.keyHash)).toEqual([
      "this-window",
    ]);
  });

  it("shows the last clean-up in Operations, counts only", async () => {
    const { lastPurge } = await getOperationsForAdmin();
    expect(lastPurge).toEqual({ enquiries: 1, applications: 2, cvs: 1, filesNotDeleted: 2, at: expect.any(Date) });
  });
});
