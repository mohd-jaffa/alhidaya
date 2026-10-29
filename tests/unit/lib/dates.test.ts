import { describe, expect, it } from "vitest";

import { dohaDay } from "@/lib/dates";

describe("dohaDay", () => {
  it("names the day in Doha, three hours ahead of UTC", () => {
    expect(dohaDay(new Date("2026-10-28T20:59:59Z"))).toBe("2026-10-28");
    expect(dohaDay(new Date("2026-10-28T21:00:00Z"))).toBe("2026-10-29");
    expect(dohaDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
