// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const publishClientOrder = vi.fn(async () => ({ done: true }));
vi.mock("@/features/clients/api", () => ({ publishClientOrder }));

const { POST } = await import("@/app/api/admin/clients/order/publish/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/clients/order/publish", { method: "POST", headers: { origin } });

describe("/api/admin/clients/order/publish", () => {
  it("publishes the client logos' order as the admin, and refuses another site's request or no session", async () => {
    stubServerEnv();
    expect(await (await POST(call())).json()).toEqual({ success: true, data: { done: true } });
    expect(publishClientOrder).toHaveBeenCalledWith(
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
    expect((await POST(call("https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await POST(call())).status).toBe(401);
    expect(publishClientOrder).toHaveBeenCalledOnce();
  });
});
