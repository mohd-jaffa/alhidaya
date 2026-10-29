import { describe, expect, it } from "vitest";

import { dohaDateTime, dohaDay, dohaDayHeading, dohaTime, readableDay } from "@/lib/dates";

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

describe("dohaDateTime", () => {
  it("writes a moment as the team reads it in Doha, on a 24-hour clock", () => {
    expect(dohaDateTime(new Date("2026-10-29T08:01:00Z"))).toBe("29 October 2026 at 11:01");
    expect(dohaDateTime(new Date("2026-10-28T21:30:00Z"))).toBe("29 October 2026 at 00:30");
  });
});

describe("the day's log (R6.1)", () => {
  it("heads a day as Doha has it, and gives each arrival its Doha time", () => {
    expect(dohaDayHeading(new Date("2026-10-28T21:30:00Z"))).toBe("Thursday 29 October 2026");
    expect(dohaTime(new Date("2026-10-28T21:30:00Z"))).toBe("00:30");
    expect(dohaTime(new Date("2026-10-29T08:01:00Z"))).toBe("11:01");
  });
});
