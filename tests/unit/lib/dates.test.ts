import { describe, expect, it } from "vitest";

import { dohaDay, readableDay } from "@/lib/dates";

describe("dohaDay", () => {
  it("names the day in Doha, three hours ahead of UTC", () => {
    expect(dohaDay(new Date("2026-10-28T20:59:59Z"))).toBe("2026-10-28");
    expect(dohaDay(new Date("2026-10-28T21:00:00Z"))).toBe("2026-10-29");
    expect(dohaDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("readableDay", () => {
  it("writes a day as a visitor reads it, the same day wherever the server is", () => {
    expect(readableDay("2026-11-30")).toBe("30 November 2026");
    expect(readableDay("2027-01-01")).toBe("1 January 2027");
  });
});
