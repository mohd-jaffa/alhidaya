// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
import { serviceFixture } from "@tests/support/fixtures/content";
const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const getServiceForAdmin = vi.fn(async (id: string) => ({ id }));
const saveServiceDraft = vi.fn(async (id: string) => ({ id, saved: true }));
vi.mock("@/features/services/api", () => ({ getServiceForAdmin, saveServiceDraft }));

const { GET, PUT } = await import("@/app/api/admin/services/[id]/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ id: "r1" }) };
const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/services/r1", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/services/[id]", () => {
  it("opens one's draft, and saves it whole as the admin (D92)", async () => {
    stubServerEnv();
    expect(await (await GET(call("GET"), params)).json()).toEqual({ success: true, data: { id: "r1" } });
    const document = serviceFixture();
    expect(await (await PUT(call("PUT", document), params)).json()).toEqual({
      success: true,
      data: { id: "r1", saved: true },
    });
    expect(saveServiceDraft).toHaveBeenCalledWith(
      "r1",
      document,
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses what fails its checks, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await PUT(call("PUT", { ...serviceFixture(), seo: null }), params)).status).toBe(400);
    expect((await PUT(call("PUT", serviceFixture(), "https://evil.example"), params)).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"), params)).status).toBe(401);
    expect(saveServiceDraft).not.toHaveBeenCalled();
  });
});
