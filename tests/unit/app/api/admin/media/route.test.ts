// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listImagesForAdmin = vi.fn(async () => [{ id: "image-1" }]);
vi.mock("@/features/media/api", () => ({ listImagesForAdmin }));

const { GET } = await import("@/app/api/admin/media/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = () =>
  new Request("http://localhost:3000/api/admin/media", { headers: { origin: "http://localhost:3000" } });

describe("/api/admin/media", () => {
  it("lists the library's images for the signed-in admin only (D89)", async () => {
    stubServerEnv();
    expect(await (await GET(call())).json()).toEqual({ success: true, data: [{ id: "image-1" }] });
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect(listImagesForAdmin).toHaveBeenCalledOnce();
  });
});
