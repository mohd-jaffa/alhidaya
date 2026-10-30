import { describe, expect, it } from "vitest";

import { API_ROUTES, ROUTES } from "@/constants/routes";

describe("the routes", () => {
  it("build record pages from their slugs", () => {
    expect(ROUTES.service("elderly-care")).toBe("/services/elderly-care");
    expect(ROUTES.quoteFor("school-nurse-staffing")).toBe("/request-a-quote?service=school-nurse-staffing");
    expect(ROUTES.job("registered-nurse")).toBe("/careers/registered-nurse");
    expect(ROUTES.applyForJob("registered-nurse")).toBe("/careers/registered-nurse/apply");
  });

  it("keep every endpoint under /api, and none of the admin's (plan §31)", () => {
    for (const route of Object.values(API_ROUTES)) {
      expect(route.startsWith("/api/")).toBe(true);
      expect(route.startsWith("/api/admin")).toBe(false);
    }
  });
});
