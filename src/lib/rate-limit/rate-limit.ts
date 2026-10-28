import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
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

/**
 * Counts one attempt in its window and says whether it is still within the
 * limit (plan §10.3, §26.4). The count is raised in one statement, so two
 * attempts at once both count; the windows are fixed, worked out in UTC by
 * the app.
 */
export async function consumeRateLimit(rule: RateLimit, at: Date = new Date()): Promise<boolean> {
  const windowMs = rule.windowMinutes * 60 * 1000;
  const windowStart = new Date(Math.floor(at.getTime() / windowMs) * windowMs);
  const keyHash = keyedHash(rule.scope, rule.key);
  const db = getDb();

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
