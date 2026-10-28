// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const signIn = vi.fn();
const signOut = vi.fn();
const getAdminSession = vi.fn();
vi.mock("@/features/auth/api", () => ({ signIn, signOut }));
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { DELETE, POST } = await import("@/app/api/admin/session/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/session", {
    method,
    headers: { origin, "content-type": "application/json", "x-forwarded-for": "203.0.113.9", "user-agent": "UA" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("POST /api/admin/session", () => {
  it("signs in and sets the session cookie", async () => {
    stubServerEnv();
    signIn.mockResolvedValue(new Headers({ "set-cookie": "alhidaya.session_token=t; HttpOnly; SameSite=Lax" }));
    const response = await POST(call("POST", { email: "Admin@AlHidaya.qa", password: "pw" }));
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie()).toEqual(["alhidaya.session_token=t; HttpOnly; SameSite=Lax"]);
    expect(signIn).toHaveBeenCalledWith(
      { email: "admin@alhidaya.qa", password: "pw" },
      expect.objectContaining({ ip: "203.0.113.9", userAgent: "UA" }),
    );
  });

  it("refuses another site's form, and a malformed one", async () => {
    stubServerEnv();
    expect((await POST(call("POST", { email: "a@b.qa", password: "pw" }, "https://evil.example"))).status).toBe(403);
    expect((await POST(call("POST", { email: "nope" }))).status).toBe(400);
    expect(signIn).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/session", () => {
  it("signs out and clears the cookie", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a1", email: "e", name: "n" });
    signOut.mockResolvedValue(new Headers({ "set-cookie": "alhidaya.session_token=; Max-Age=0" }));
    const response = await DELETE(call("DELETE"));
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie()).toEqual(["alhidaya.session_token=; Max-Age=0"]);
    expect(signOut).toHaveBeenCalledWith(expect.any(Headers), "a1", expect.stringMatching(/^req_/));
  });
});
