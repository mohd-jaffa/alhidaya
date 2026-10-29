import { describe, expect, it } from "vitest";

import {
  CV_EXPIRY_DAYS,
  DISK_BUDGETS,
  FORM_RATE_LIMIT,
  RETENTION_DAYS,
  TEXT_LIMITS,
  UPLOAD_LIMITS,
} from "@/constants/limits";

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

  it("let a visitor send each form five times in ten minutes (plan Q16)", () => {
    expect(FORM_RATE_LIMIT).toEqual({ limit: 5, windowMinutes: 10 });
  });

  it("fit the longest CV key the storage makes in its column", () => {
    const longest = `2026-10/2026-10-29_${"j".repeat(40)}_${"a".repeat(40)}_${"0".repeat(10)}.docx`;
    expect(longest.length).toBeLessThanOrEqual(TEXT_LIMITS.fileKey);
  });
});
