// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_OPERATIONS } from "@/lib/content/operations";
import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const getOperationsForAdmin = vi.fn(async () => ({ view: true }));
const saveOperations = vi.fn(async () => ({ saved: true }));
vi.mock("@/features/settings/api", () => ({ getOperationsForAdmin, saveOperations }));

const { GET, PUT } = await import("@/app/api/admin/operations/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/operations", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/operations", () => {
  it("shows how the site runs, and changes it as the admin (D95)", async () => {
    stubServerEnv();
    expect(await (await GET(call("GET"))).json()).toEqual({ success: true, data: { view: true } });
    expect(await (await PUT(call("PUT", DEFAULT_OPERATIONS))).json()).toEqual({ success: true, data: { saved: true } });
    expect(saveOperations).toHaveBeenCalledWith(DEFAULT_OPERATIONS, expect.objectContaining({ adminId: "admin-1" }));
  });

  it("refuses a keeping period out of its range, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await PUT(call("PUT", { ...DEFAULT_OPERATIONS, retentionDays: 400 }))).status).toBe(400);
    expect((await PUT(call("PUT", DEFAULT_OPERATIONS, "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"))).status).toBe(401);
    expect(saveOperations).not.toHaveBeenCalled();
  });
});
