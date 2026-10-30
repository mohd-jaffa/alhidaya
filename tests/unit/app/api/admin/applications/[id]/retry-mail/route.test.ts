// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const retryApplicationAlert = vi.fn(async () => "SENT");
vi.mock("@/features/careers/api", () => ({ retryApplicationAlert }));

const { POST } = await import("@/app/api/admin/applications/[id]/retry-mail/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/admin/applications/[id]/retry-mail", () => {
  it("sends the HR email again as the admin, and says how it went", async () => {
    stubServerEnv();
    const response = await POST(
      new Request("http://localhost:3000/api/admin/applications/application-1/retry-mail", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      }),
      { params: Promise.resolve({ id: "application-1" }) },
    );
    expect(await response.json()).toEqual({ success: true, data: { emailStatus: "SENT" } });
    expect(retryApplicationAlert).toHaveBeenCalledWith(
      "application-1",
      expect.objectContaining({ adminId: "admin-1" }),
    );
  });
});
