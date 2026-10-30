// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const discardServiceDraft = vi.fn(async (id: string) => ({ id }));
vi.mock("@/features/services/api", () => ({ discardServiceDraft }));

const { POST } = await import("@/app/api/admin/services/[id]/discard/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "r1" }) };
const call = (origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/services/r1/discard", { method: "POST", headers: { origin } });

describe("/api/admin/services/[id]/discard", () => {
  it("throws a service's draft away as the admin, and refuses another site's request or no session", async () => {
    stubServerEnv();
    expect(await (await POST(call(), params)).json()).toEqual({ success: true, data: { id: "r1" } });
    expect(discardServiceDraft).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
    expect((await POST(call("https://evil.example"), params)).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await POST(call(), params)).status).toBe(401);
    expect(discardServiceDraft).toHaveBeenCalledOnce();
  });
});
