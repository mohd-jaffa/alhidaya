import { describe, expect, it } from "vitest";

import { API_ROUTES } from "@/constants/routes";
import { todayKey } from "@/lib/inbox/keys";

describe("todayKey", () => {
  it("names Today's list by what differs from its defaults, always in one order", () => {
    expect(todayKey()).toBe(API_ROUTES.adminToday);
    expect(todayKey({ needsYou: false, page: 1 })).toBe(API_ROUTES.adminToday);
    expect(todayKey({ needsYou: true, page: 2 })).toBe(`${API_ROUTES.adminToday}?needsYou=true&page=2`);
  });
});
