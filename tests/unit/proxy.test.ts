// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, proxy } from "@/proxy";

const visit = (path: string, cookie?: string) =>
  proxy(new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} }));

describe("the admin gate", () => {
  it("sends a visitor with no session to sign-in, keeping where they were headed", () => {
    const response = visit("/admin/services?page=2");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/admin/login?next=%2Fadmin%2Fservices%3Fpage%3D2",
    );
  });

  it("lets the sign-in and password pages open to anyone, unindexed", () => {
    for (const path of ["/admin/login", "/admin/forgot-password", "/admin/reset-password"]) {
      const response = visit(path);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    }
  });

  it("lets a session cookie through, plain or secure", () => {
    expect(visit("/admin", "alhidaya.session_token=t").headers.get("location")).toBeNull();
    expect(visit("/admin", "__Secure-alhidaya.session_token=t").headers.get("location")).toBeNull();
    expect(visit("/admin", "other.session_token=t").headers.get("location")).toContain("/admin/login");
  });

  it("guards only the admin pages", () => {
    expect(config.matcher).toEqual(["/admin", "/admin/:path*"]);
  });
});
