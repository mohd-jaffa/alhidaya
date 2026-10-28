import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { auditLog, errorLog } from "@/db/schema";
import { logActionSafe } from "@/lib/audit/auditLog";
import { captureError } from "@/lib/audit/errorLog";
import { cleanUpLogs } from "@/lib/audit/retention";

const REQUEST = `req_logs_${crypto.randomUUID()}`;
const DAY = 24 * 60 * 60 * 1000;

afterAll(async () => {
  const db = getDb();
  await db.delete(auditLog).where(eq(auditLog.requestId, REQUEST));
  await db.delete(errorLog).where(eq(errorLog.reference, REQUEST));
  await closeDb();
});

describe("the logs, against the local MySQL", () => {
  it("record an admin's change", async () => {
    await logActionSafe({
      actorId: null,
      action: "PUBLISH",
      entityType: "services",
      entityId: "s1",
      requestId: REQUEST,
    });
    const rows = await getDb().select().from(auditLog).where(eq(auditLog.requestId, REQUEST));
    expect(rows).toEqual([expect.objectContaining({ action: "PUBLISH", entityType: "services", entityId: "s1" })]);
  });

  it("refuse an action the code does not know, and log the refusal instead", async () => {
    await logActionSafe({ actorId: null, action: "HACK" as never, entityType: "x", requestId: REQUEST });
    const failures = await getDb().select().from(errorLog).where(eq(errorLog.reference, REQUEST));
    expect(failures.map((row) => row.message)).toContain("Failed to write audit log");
  });

  it("keep a failure's context, redacted", async () => {
    await captureError({ message: "Probe", reference: REQUEST, context: { phone: "+97431306555", step: 2 } });
    const [row] = await getDb().select().from(errorLog).where(eq(errorLog.message, "Probe"));
    expect(row.context).toEqual({ phone: "[Redacted]", step: 2 });
  });

  it("remove only what is past its keeping", async () => {
    const db = getDb();
    const now = new Date();
    const ids = {
      oldError: crypto.randomUUID(),
      newError: crypto.randomUUID(),
      oldAudit: crypto.randomUUID(),
      newAudit: crypto.randomUUID(),
    };
    await db.insert(errorLog).values([
      {
        id: ids.oldError,
        source: "SERVER",
        message: "old",
        reference: REQUEST,
        createdAt: new Date(now.getTime() - 31 * DAY),
      },
      {
        id: ids.newError,
        source: "SERVER",
        message: "new",
        reference: REQUEST,
        createdAt: new Date(now.getTime() - 29 * DAY),
      },
    ]);
    await db.insert(auditLog).values([
      {
        id: ids.oldAudit,
        action: "UPDATE",
        entityType: "x",
        requestId: REQUEST,
        createdAt: new Date(now.getTime() - 366 * DAY),
      },
      {
        id: ids.newAudit,
        action: "UPDATE",
        entityType: "x",
        requestId: REQUEST,
        createdAt: new Date(now.getTime() - 364 * DAY),
      },
    ]);

    const removed = await cleanUpLogs(now);
    expect(removed.errors).toBeGreaterThanOrEqual(1);
    expect(removed.audit).toBeGreaterThanOrEqual(1);
    const errorsLeft = await db
      .select({ id: errorLog.id })
      .from(errorLog)
      .where(inArray(errorLog.id, [ids.oldError, ids.newError]));
    const auditLeft = await db
      .select({ id: auditLog.id })
      .from(auditLog)
      .where(inArray(auditLog.id, [ids.oldAudit, ids.newAudit]));
    expect(errorsLeft.map((row) => row.id)).toEqual([ids.newError]);
    expect(auditLeft.map((row) => row.id)).toEqual([ids.newAudit]);
  });

  it("cleans up as of now when not told otherwise", async () => {
    expect(await cleanUpLogs()).toEqual({ errors: expect.any(Number), audit: expect.any(Number) });
  });
});
