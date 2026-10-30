import { describe, expect, it } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { todayKey } from "@/lib/inbox/keys";

describe("todayKey", () => {
  it("names Today's list by what differs from its defaults, always in one order", () => {
    expect(todayKey()).toBe(ADMIN_API_ROUTES.adminToday);
    expect(todayKey({ needsYou: false, page: 1 })).toBe(ADMIN_API_ROUTES.adminToday);
    expect(todayKey({ needsYou: true, page: 2 })).toBe(`${ADMIN_API_ROUTES.adminToday}?needsYou=true&page=2`);
  });
});
