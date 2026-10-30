import { describe, expect, it } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { activityKey } from "@/features/activity/api.client";

describe("activityKey", () => {
  it("names a kind and a page after the first, and nothing else (D96)", () => {
    expect(activityKey()).toBe(ADMIN_API_ROUTES.adminActivity);
    expect(activityKey({ page: 1 })).toBe(ADMIN_API_ROUTES.adminActivity);
    expect(activityKey({ kind: "INBOX", page: 3 })).toBe(`${ADMIN_API_ROUTES.adminActivity}?kind=INBOX&page=3`);
  });
});
