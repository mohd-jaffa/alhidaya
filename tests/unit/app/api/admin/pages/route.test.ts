// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listPagesForAdmin = vi.fn(async () => [{ page: "HOME", publishedAt: null, unpublishedChanges: true }]);
vi.mock("@/features/content/api", () => ({ listPagesForAdmin }));

const { GET } = await import("@/app/api/admin/pages/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = () =>
  new Request("http://localhost:3000/api/admin/pages", { headers: { origin: "http://localhost:3000" } });

describe("/api/admin/pages", () => {
  it("lists the pages with where each stands, for the signed-in admin only", async () => {
    stubServerEnv();
    const response = await GET(call());
    expect(await response.json()).toEqual({
      success: true,
      data: [{ page: "HOME", publishedAt: null, unpublishedChanges: true }],
    });
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect(listPagesForAdmin).toHaveBeenCalledOnce();
  });
});
