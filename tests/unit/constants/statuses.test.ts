import { describe, expect, it } from "vitest";

import { AUDIT_ACTIONS, ERROR_SOURCES } from "@/constants/statuses";

describe("the vocabularies", () => {
  it("have no repeats and fit their columns", () => {
    for (const [list, width] of [
      [AUDIT_ACTIONS, 32],
      [ERROR_SOURCES, 16],
    ] as const) {
      expect(new Set(list).size).toBe(list.length);
      for (const value of list) expect(value.length).toBeLessThanOrEqual(width);
    }
  });

  it("record the admin's CV downloads (plan §9.4)", () => {
    expect(AUDIT_ACTIONS).toContain("CV_DOWNLOAD");
  });
});
