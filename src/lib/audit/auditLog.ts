import { getDb } from "@/db/client";
import { auditLog } from "@/db/schema";

import { captureError } from "./errorLog";
import type { AuditEntry } from "./types";

/**
 * Records one of the admin's changes (AGENTS.md §11), with the admin taken
 * from the session the route checked.
 *
 * A failure is logged and swallowed: the change it describes has already
 * happened, and refusing it now would report a failure that did not occur.
 */
export async function logActionSafe(entry: AuditEntry): Promise<void> {
  try {
    await getDb()
      .insert(auditLog)
      .values({
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        changes: entry.changes ?? null,
        summary: entry.summary ?? null,
        requestId: entry.requestId ?? null,
      });
  } catch (error) {
    await captureError({
      message: "Failed to write audit log",
      error,
      adminId: entry.actorId,
      reference: entry.requestId ?? undefined,
      context: { action: entry.action, entityType: entry.entityType, entityId: entry.entityId },
    });
  }
}
