import { describe, expect, it } from "vitest";

import { monthFolder, randomPart, slugForFile } from "@/lib/storage/names";

describe("slugForFile", () => {
  it("keeps only safe characters", () => {
    expect(slugForFile("Registered General Nurse – Home Care", 40, "x")).toBe("registered-general-nurse-home-care");
    expect(slugForFile("  Zoë O'Brien  ", 40, "x")).toBe("zoe-o-brien");
    expect(slugForFile("../../etc/passwd", 40, "x")).toBe("etc-passwd");
  });

  it("bounds the length without a trailing hyphen, and falls back when nothing is left", () => {
    expect(slugForFile("a".repeat(39) + " b", 40, "x")).toBe("a".repeat(39));
    expect(slugForFile("مريم علي", 40, "applicant")).toBe("applicant");
    expect(slugForFile("", 40, "general")).toBe("general");
  });
});

describe("the other name parts", () => {
  it("are random and short, and name the month in UTC", () => {
    expect(randomPart()).toMatch(/^[0-9a-f]{10}$/);
    expect(randomPart()).not.toBe(randomPart());
    expect(monthFolder(new Date("2026-10-31T23:30:00Z"))).toBe("2026-10");
  });
});
