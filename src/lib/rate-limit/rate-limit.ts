import { and, eq, sql } from "drizzle-orm";

import { type Database, getDb } from "@/db/client";
import { rateLimits } from "@/db/schema";
import { keyedHash } from "@/lib/auth/hash";

export interface RateLimit {
  /** What is being counted, and of whom: "reset:ip", "enquiry:ip". */
  scope: string;
  /** The email or IP being counted; only its keyed hash is stored. */
  key: string;
  limit: number;
  windowMinutes: number;
}

/** The database, or a transaction that the count belongs to. */
export type RateLimitExecutor = Pick<Database, "insert" | "select">;

/**
 * Counts one attempt in its window and says whether it is still within the
 * limit (plan §10.3, §26.4). The count is raised in one statement, so two
 * attempts at once both count; the windows are fixed, worked out in UTC by
 * the app. Given a transaction, the count is part of it: a submission that
 * is refused or fails is not counted, and the visitor's row stays locked
 * until it commits.
 */
export async function consumeRateLimit(
  rule: RateLimit,
  at: Date = new Date(),
  db: RateLimitExecutor = getDb(),
): Promise<boolean> {
  const windowMs = rule.windowMinutes * 60 * 1000;
  const windowStart = new Date(Math.floor(at.getTime() / windowMs) * windowMs);
  const keyHash = keyedHash(rule.scope, rule.key);

  await db
    .insert(rateLimits)
    .values({ keyHash, windowStart, count: 1 })
    .onDuplicateKeyUpdate({ set: { count: sql`${rateLimits.count} + 1`, updatedAt: at } });
  const [row] = await db
    .select({ count: rateLimits.count })
    .from(rateLimits)
    .where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.windowStart, windowStart)));
  return row.count <= rule.limit;
}
