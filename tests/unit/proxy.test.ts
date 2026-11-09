// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { config, proxy } from "@/proxy";

const visit = (path: string, cookie?: string) =>
  proxy(new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} }));

afterEach(() => vi.unstubAllEnvs());

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

  it("protects public HTML with fresh nonces without gating it or excluding it from indexing", () => {
    vi.stubEnv("NODE_ENV", "production");
    const first = visit("/about");
    const second = visit("/about");
    expect(first.headers.get("location")).toBeNull();
    expect(first.headers.get("x-robots-tag")).toBeNull();
    const policy = first.headers.get("content-security-policy");
    expect(policy).toContain("'nonce-");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toBe(second.headers.get("content-security-policy"));
    expect(first.headers.get("x-middleware-request-content-security-policy")).toBe(policy);
    expect(config.matcher).toEqual(["/((?!api(?:/|$)|_next(?:/|$)|media(?:/|$)).*)"]);
  });

  it("enables the development debugger and overrides caller-supplied security headers", () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = proxy(
      new NextRequest("http://localhost/about", {
        headers: { "x-nonce": "attacker", "Content-Security-Policy": "default-src *" },
      }),
    );
    expect(response.headers.get("content-security-policy")).toContain("'unsafe-eval'");
    expect(response.headers.get("x-middleware-request-x-nonce")).not.toBe("attacker");
  });
});
