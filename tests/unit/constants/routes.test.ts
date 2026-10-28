import { describe, expect, it } from "vitest";

import { ADMIN_ROUTES, ROUTES } from "@/constants/routes";

describe("the routes", () => {
  it("build record pages from their slugs", () => {
    expect(ROUTES.service("elderly-care")).toBe("/services/elderly-care");
    expect(ROUTES.job("registered-nurse")).toBe("/careers/registered-nurse");
    expect(ROUTES.applyForJob("registered-nurse")).toBe("/careers/registered-nurse/apply");
    expect(ADMIN_ROUTES.page("HOME")).toBe("/admin/pages/HOME");
  });

  it("keep every admin page under /admin", () => {
    for (const route of Object.values(ADMIN_ROUTES)) {
      const path = typeof route === "function" ? route("x") : route;
      expect(path.startsWith("/admin")).toBe(true);
    }
  });
});
