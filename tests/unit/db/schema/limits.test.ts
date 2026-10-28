import { getTableConfig } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { rateLimits } from "@/db/schema";

describe("rate_limits", () => {
  it("counts once per key and window, by a keyed hash only", () => {
    const table = getTableConfig(rateLimits);
    expect(table.primaryKeys[0].getName()).toBe("rate_limits_pk");
    expect(table.primaryKeys[0].columns.map((column) => column.name)).toEqual(["key_hash", "window_start"]);
    expect(table.columns.map((column) => column.name)).not.toContain("ip");
  });
});
