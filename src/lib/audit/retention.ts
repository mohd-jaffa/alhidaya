import { lt } from "drizzle-orm";

import { LOG_KEEP_DAYS } from "@/constants/limits";
import { getDb } from "@/db/client";
import { auditLog, errorLog } from "@/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Removes log rows past their keeping (plan §36): server failures after a
 * month, the admin's changes after a year. Run by the daily job (R6.7); the
 * cut-off is worked out here, in UTC, never by the database's own clock.
 */
export async function cleanUpLogs(at: Date = new Date()): Promise<{ errors: number; audit: number }> {
  const db = getDb();
  const [errors] = await db
    .delete(errorLog)
    .where(lt(errorLog.createdAt, new Date(at.getTime() - LOG_KEEP_DAYS.errors * DAY_MS)));
  const [audit] = await db
    .delete(auditLog)
    .where(lt(auditLog.createdAt, new Date(at.getTime() - LOG_KEEP_DAYS.audit * DAY_MS)));
  return { errors: errors.affectedRows, audit: audit.affectedRows };
}
