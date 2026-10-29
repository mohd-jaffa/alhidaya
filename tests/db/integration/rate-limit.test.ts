import { inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { rateLimits } from "@/db/schema";
import { keyedHash } from "@/lib/auth/hash";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";

const KEY = `rate-${crypto.randomUUID()}`;

afterAll(async () => {
  await getDb()
    .delete(rateLimits)
    .where(inArray(rateLimits.keyHash, [keyedHash("test:ip", KEY)]));
  await closeDb();
});

describe("consumeRateLimit", () => {
  it("allows the limit in a window, refuses past it, and starts again in the next", async () => {
    const rule = { scope: "test:ip", key: KEY, limit: 2, windowMinutes: 10 };
    const at = new Date("2026-10-28T10:01:00Z");
    expect(await consumeRateLimit(rule, at)).toBe(true);
    expect(await consumeRateLimit(rule, new Date("2026-10-28T10:09:59Z"))).toBe(true);
    expect(await consumeRateLimit(rule, new Date("2026-10-28T10:05:00Z"))).toBe(false);
    expect(await consumeRateLimit(rule, new Date("2026-10-28T10:10:00Z"))).toBe(true);
  });

  it("counts now when not told otherwise", async () => {
    expect(await consumeRateLimit({ scope: "test:ip", key: KEY, limit: 100, windowMinutes: 1 })).toBe(true);
  });

  it("keeps no count from a transaction that rolled back", async () => {
    const rule = { scope: "test:ip", key: KEY, limit: 1, windowMinutes: 10 };
    const at = new Date("2026-10-29T10:01:00Z");
    await expect(
      getDb().transaction(async (tx) => {
        expect(await consumeRateLimit(rule, at, tx)).toBe(true);
        throw new Error("rolled back");
      }),
    ).rejects.toThrow("rolled back");
    expect(await consumeRateLimit(rule, at)).toBe(true);
  });
});
