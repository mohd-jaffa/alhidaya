import { describe, expect, it } from "vitest";

import { ADMIN_API_ROUTES, ADMIN_PUBLIC_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";

describe("the admin's routes", () => {
  it("build an editor's or an arrival's page from what it names", () => {
    expect(ADMIN_ROUTES.page("HOME")).toBe("/admin/pages/home");
    expect(ADMIN_ROUTES.enquiry("e1")).toBe("/admin/enquiries/e1");
    expect(ADMIN_ROUTES.service("s1")).toBe("/admin/services/s1");
    expect(ADMIN_ROUTES.job("j1")).toBe("/admin/jobs/j1");
    expect(ADMIN_ROUTES.client("c1")).toBe("/admin/clients/c1");
  });

  it("keep every admin page under /admin, and let only signing in and the password's way back open without a session", () => {
    for (const route of Object.values(ADMIN_ROUTES)) {
      const path = typeof route === "function" ? route("HOME") : route;
      expect(path.startsWith("/admin")).toBe(true);
    }
    expect(ADMIN_PUBLIC_ROUTES).toEqual([ADMIN_ROUTES.login, ADMIN_ROUTES.forgotPassword, ADMIN_ROUTES.resetPassword]);
  });

  it("keep every endpoint under /api/admin", () => {
    for (const route of Object.values(ADMIN_API_ROUTES)) {
      expect((typeof route === "function" ? route("HOME") : route).startsWith("/api/admin/")).toBe(true);
    }
    expect(ADMIN_API_ROUTES.adminEnquiryRetryMail("e1")).toBe("/api/admin/enquiries/e1/retry-mail");
    expect(ADMIN_API_ROUTES.adminPagePublish("PRIVACY")).toBe("/api/admin/pages/privacy/publish");
    expect(ADMIN_API_ROUTES.adminServiceArchive("s1")).toBe("/api/admin/services/s1/archive");
    expect(ADMIN_API_ROUTES.adminJobClose("j1")).toBe("/api/admin/jobs/j1/close");
    expect(ADMIN_API_ROUTES.adminMediaItem("m1")).toBe("/api/admin/media/m1");
  });
});
