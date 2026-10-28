// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const getAdminSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { withAdminRoute, withCookies } = await import("@/lib/api/admin");

afterEach(() => {
  vi.unstubAllEnvs();
  getAdminSession.mockReset();
});

const request = (origin = "http://localhost:3000", method = "POST") =>
  new Request("http://localhost:3000/api/admin/x", { method, headers: { origin } });

describe("withAdminRoute", () => {
  it("hands the route its admin", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a1", email: "e", name: "n" });
    const response = await withAdminRoute(request(), async ({ admin, adminId }) => ({ admin, adminId }), {
      successStatus: 201,
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      data: { admin: { adminId: "a1", email: "e", name: "n" }, adminId: "a1" },
    });
  });

  it("refuses without a session", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue(null);
    const response = await withAdminRoute(request(), async () => "never");
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("AUTH_SESSION_REQUIRED");
  });

  it("refuses a write from another site before looking at the session", async () => {
    stubServerEnv();
    const response = await withAdminRoute(request("https://evil.example"), async () => "never");
    expect(response.status).toBe(403);
    expect(getAdminSession).not.toHaveBeenCalled();
  });
});

describe("withCookies", () => {
  it("copies every cookie onto the answer", () => {
    const headers = new Headers();
    headers.append("set-cookie", "a=1; HttpOnly");
    headers.append("set-cookie", "b=2; HttpOnly");
    const response = withCookies(new Response("ok"), headers);
    expect(response.headers.getSetCookie()).toEqual(["a=1; HttpOnly", "b=2; HttpOnly"]);
  });
});
