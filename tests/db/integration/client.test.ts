import { eq, sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { signInAttempts } from "@/db/schema";

const KEY = "integration-client-test".padEnd(64, "0");

afterAll(async () => {
  await getDb().delete(signInAttempts).where(eq(signInAttempts.keyHash, KEY));
  await closeDb();
  await closeDb();
});

describe("getDb", () => {
  it("is one pool for the process", () => {
    expect(getDb()).toBe(getDb());
  });

  it("runs every connection in UTC", async () => {
    const [rows] = (await getDb().execute(sql`select @@session.time_zone as zone`)) as unknown as [{ zone: string }[]];
    expect(rows[0].zone).toBe("+00:00");
  });

  it("writes and reads rows with their timestamps, to the millisecond", async () => {
    const db = getDb();
    await db.insert(signInAttempts).values({ keyHash: KEY, failedCount: 1 });
    const [row] = await db.select().from(signInAttempts).where(eq(signInAttempts.keyHash, KEY));
    expect(row.failedCount).toBe(1);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(Math.abs(row.createdAt.getTime() - Date.now())).toBeLessThan(60_000);

    await db.update(signInAttempts).set({ failedCount: 2 }).where(eq(signInAttempts.keyHash, KEY));
    const [updated] = await db.select().from(signInAttempts).where(eq(signInAttempts.keyHash, KEY));
    expect(updated.failedCount).toBe(2);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(row.updatedAt.getTime());
  });
});
