import { and, gt, inArray, isNotNull } from "drizzle-orm";
import { eq, sql } from "drizzle-orm";

import { SIGN_IN_LOCKOUT } from "@/constants/limits";
import { getDb } from "@/db/client";
import { signInAttempts } from "@/db/schema";
import { keyedHash } from "@/lib/auth/hash";

/**
 * The sign-in lockout (plan §26.4): five failures for an email, or from an
 * IP, pause sign-in for that email or IP for fifteen minutes. Each is counted
 * under its keyed hash; neither is stored.
 */
export function lockoutKeys(email: string, ip: string): string[] {
  return [keyedHash("sign-in:email", email), keyedHash("sign-in:ip", ip)];
}

export async function isLocked(keys: string[], at: Date = new Date()): Promise<boolean> {
  const locked = await getDb()
    .select({ keyHash: signInAttempts.keyHash })
    .from(signInAttempts)
    .where(
      and(
        inArray(signInAttempts.keyHash, keys),
        isNotNull(signInAttempts.lockedUntil),
        gt(signInAttempts.lockedUntil, at),
      ),
    )
    .limit(1);
  return locked.length > 0;
}

/**
 * Counts one failure against each key and says whether any is now locked. A
 * count left from a lock that has passed starts again; the row is locked
 * while it is read, so two failures at once are both counted.
 */
export async function recordFailure(keys: string[], at: Date = new Date()): Promise<boolean> {
  const lockUntil = new Date(at.getTime() + SIGN_IN_LOCKOUT.lockMinutes * 60 * 1000);
  return getDb().transaction(async (tx) => {
    let locked = false;
    for (const keyHash of keys) {
      await tx
        .insert(signInAttempts)
        .values({ keyHash, failedCount: 0 })
        .onDuplicateKeyUpdate({ set: { keyHash: sql`${signInAttempts.keyHash}` } });
      const [row] = await tx.select().from(signInAttempts).where(eq(signInAttempts.keyHash, keyHash)).for("update");
      const lapsed = row.lockedUntil !== null && row.lockedUntil <= at;
      const failedCount = (lapsed ? 0 : row.failedCount) + 1;
      const lockedUntil = failedCount >= SIGN_IN_LOCKOUT.failedAttempts ? lockUntil : lapsed ? null : row.lockedUntil;
      await tx
        .update(signInAttempts)
        .set({ failedCount, lockedUntil, updatedAt: at })
        .where(eq(signInAttempts.keyHash, keyHash));
      locked ||= lockedUntil !== null && lockedUntil > at;
    }
    return locked;
  });
}

/** A successful sign-in forgets the email's and the IP's failures. */
export async function clearFailures(keys: string[]): Promise<void> {
  await getDb().delete(signInAttempts).where(inArray(signInAttempts.keyHash, keys));
}
