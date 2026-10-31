import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const config = readFileSync("next.config.ts", "utf8");

describe("the Next configuration", () => {
  it("keeps published content cached in memory only, so a restart never brings back what a publish replaced (D119)", () => {
    expect(config).toMatch(/experimental:\s*{[^}]*isrFlushToDisk:\s*false/);
  });

  it("builds the standalone folder Passenger serves (plan §35.3)", () => {
    expect(config).toMatch(/output:\s*"standalone"/);
  });
});
