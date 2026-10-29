import { describe, expect, it } from "vitest";

import { ADMIN_ROUTES } from "@/constants/routes";
import { adminReturnPath } from "@/lib/auth/next";

describe("adminReturnPath", () => {
  it("returns the admin to the admin page they were headed to, with its query", () => {
    expect(adminReturnPath("/admin/enquiries/e-1")).toBe("/admin/enquiries/e-1");
    expect(adminReturnPath("/admin?view=everything")).toBe("/admin?view=everything");
    expect(adminReturnPath(" /admin ")).toBe("/admin");
  });

  it("sends anything else to Today: another site, the API, sign-in itself, nothing", () => {
    for (const next of [
      "https://evil.example/admin",
      "//evil.example/admin",
      "/\\\\evil.example",
      "/admin\\\\..\\\\x",
      "/administrator",
      "/api/admin/enquiries",
      ADMIN_ROUTES.login,
      `${ADMIN_ROUTES.login}?next=/admin`,
      ["/admin"],
      undefined,
    ]) {
      expect(adminReturnPath(next), String(next)).toBe(ADMIN_ROUTES.overview);
    }
  });
});
