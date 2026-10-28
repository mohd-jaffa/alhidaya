// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const resetPassword = vi.fn(async () => {});
vi.mock("@/features/auth/api", () => ({ resetPassword }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { POST } = await import("@/app/api/admin/password/reset/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (body: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/password/reset", {
    method: "POST",
    headers: { origin },
    body: JSON.stringify(body),
  });

describe("POST /api/admin/password/reset", () => {
  it("sets the new password from the link's token", async () => {
    stubServerEnv();
    const response = await POST(call({ token: "tok", password: "a long passphrase" }));
    expect(await response.json()).toEqual({ success: true, data: { reset: true } });
    expect(resetPassword).toHaveBeenCalledWith("tok", "a long passphrase", expect.stringMatching(/^req_/));
  });

  it("refuses a short password and another site's form", async () => {
    stubServerEnv();
    expect((await POST(call({ token: "tok", password: "short" }))).status).toBe(400);
    expect((await POST(call({ token: "tok", password: "a long passphrase" }, "https://evil.example"))).status).toBe(
      403,
    );
    expect(resetPassword).not.toHaveBeenCalled();
  });
});
