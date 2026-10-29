import { MySqlDialect } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { emptyList, newId, now, oneOf } from "@/db/schema/columns";

describe("the shared columns", () => {
  it("make a fresh random UUID for each row", () => {
    const first = newId();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(newId()).not.toBe(first);
  });

  it("stamp the present moment", () => {
    const before = Date.now();
    const stamp = now();
    expect(stamp).toBeInstanceOf(Date);
    expect(stamp.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("write a vocabulary's CHECK from its constant", () => {
    expect(new MySqlDialect().sqlToQuery(oneOf("kind", ["IMAGE", "PDF"])).sql).toBe("`kind` in ('IMAGE', 'PDF')");
  });

  it("give each new row a list of its own", () => {
    const first = emptyList();
    expect(first).toEqual([]);
    expect(emptyList()).not.toBe(first);
  });
});
