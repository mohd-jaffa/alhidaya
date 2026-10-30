// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const setClientArchived = vi.fn(async (id: string, archived: boolean) => ({ id, archived }));
vi.mock("@/features/clients/api", () => ({ setClientArchived }));

const { POST } = await import("@/app/api/admin/clients/[id]/archive/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "r1" }) };
const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/clients/r1/archive", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/clients/[id]/archive", () => {
  it("takes a client logo off the site or puts it back, as the admin (D92)", async () => {
    stubServerEnv();
    expect(await (await POST(call("POST", { archived: true }), params)).json()).toEqual({
      success: true,
      data: { id: "r1", archived: true },
    });
    await POST(call("POST", { archived: false }), params);
    expect(setClientArchived.mock.calls).toEqual([
      ["r1", true, expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) })],
      ["r1", false, expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) })],
    ]);
  });

  it("refuses a body that says neither, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await POST(call("POST", { archived: "yes" }), params)).status).toBe(400);
    expect((await POST(call("POST", { archived: true }, "https://evil.example"), params)).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await POST(call("POST", { archived: true }), params)).status).toBe(401);
    expect(setClientArchived).not.toHaveBeenCalled();
  });
});
