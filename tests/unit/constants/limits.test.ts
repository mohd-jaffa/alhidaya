import { describe, expect, it } from "vitest";

import { CV_EXPIRY_DAYS, DISK_BUDGETS, RETENTION_DAYS, UPLOAD_LIMITS } from "@/constants/limits";

const MB = 1024 * 1024;

describe("the limits", () => {
  it("keep uploads to the decided sizes (plan D52)", () => {
    expect(UPLOAD_LIMITS.cvBytes).toBe(5 * MB);
    expect(UPLOAD_LIMITS.imageBytes).toBe(10 * MB);
  });

  it("keep retention and CV expiry within a year (plan D24, D52)", () => {
    for (const range of [RETENTION_DAYS, CV_EXPIRY_DAYS]) {
      expect(range.min).toBe(1);
      expect(range.max).toBe(365);
      expect(range.default).toBeGreaterThanOrEqual(range.min);
      expect(range.default).toBeLessThanOrEqual(range.max);
    }
  });

  it("leave room on the 1 GB disk (plan §21.2)", () => {
    expect(DISK_BUDGETS.mediaBytes + DISK_BUDGETS.cvBytes).toBeLessThanOrEqual(500 * MB);
  });
});
