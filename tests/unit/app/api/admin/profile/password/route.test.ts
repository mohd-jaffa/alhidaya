// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const changeAdminPassword = vi.fn();
const getAdminSession = vi.fn();
vi.mock("@/features/auth/api", () => ({ changeAdminPassword }));
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { POST } = await import("@/app/api/admin/profile/password/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (body: unknown) =>
  new Request("http://localhost:3000/api/admin/profile/password", {
    method: "POST",
    headers: { origin: "http://localhost:3000", "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const passwords = {
  currentPassword: "the old passphrase",
  newPassword: "a new long passphrase",
  confirmPassword: "a new long passphrase",
};

describe("POST /api/admin/profile/password (D115)", () => {
  it("changes the password and renews this session's cookie", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a1", email: "admin@alhidaya.qa", name: "Mariam" });
    changeAdminPassword.mockResolvedValue(new Headers({ "set-cookie": "alhidaya.session_token=new; HttpOnly" }));
    const response = await POST(call(passwords));
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie()).toEqual(["alhidaya.session_token=new; HttpOnly"]);
    expect(changeAdminPassword).toHaveBeenCalledWith(
      expect.any(Headers),
      "a1",
      { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
      expect.stringMatching(/^req_/),
    );
  });

  it("refuses a short new password, two that differ, and no session", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a1", email: "admin@alhidaya.qa", name: "Mariam" });
    expect((await POST(call({ ...passwords, newPassword: "short", confirmPassword: "short" }))).status).toBe(400);
    expect((await POST(call({ ...passwords, confirmPassword: "something else" }))).status).toBe(400);
    getAdminSession.mockResolvedValue(null);
    expect((await POST(call(passwords))).status).toBe(401);
    expect(changeAdminPassword).not.toHaveBeenCalled();
  });
});
