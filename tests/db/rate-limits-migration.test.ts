import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sql = readFileSync("drizzle/0002_rate_limits.sql", "utf8");

describe("0002_rate_limits", () => {
  it("keys each window by a hash, never an address", () => {
    expect(sql).toContain("CONSTRAINT `rate_limits_pk` PRIMARY KEY(`key_hash`,`window_start`)");
    expect(sql).not.toMatch(/`ip|`email/);
  });
});
