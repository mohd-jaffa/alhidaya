// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const requestPasswordReset = vi.fn(async () => {});
vi.mock("@/features/auth/api", () => ({ requestPasswordReset }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { POST } = await import("@/app/api/admin/password/forgot/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (body: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/password/forgot", {
    method: "POST",
    headers: { origin, "x-forwarded-for": "203.0.113.9" },
    body: JSON.stringify(body),
  });

describe("POST /api/admin/password/forgot", () => {
  it("answers the same whether or not the email is the admin's", async () => {
    stubServerEnv();
    const response = await POST(call({ email: "Someone@Example.com" }));
    expect(await response.json()).toEqual({ success: true, data: { requested: true } });
    expect(requestPasswordReset).toHaveBeenCalledWith(
      "someone@example.com",
      expect.objectContaining({ ip: "203.0.113.9" }),
    );
  });

  it("refuses another site's form", async () => {
    stubServerEnv();
    expect((await POST(call({ email: "a@b.qa" }, "https://evil.example"))).status).toBe(403);
  });
});
