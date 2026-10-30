// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const publishPage = vi.fn(async () => ({ publishedAt: "2026-10-30T10:00:00.000Z" }));
vi.mock("@/features/content/api", () => ({ publishPage, pageFromParam: () => "HOME" }));

const { POST } = await import("@/app/api/admin/pages/[key]/publish/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const params = { params: Promise.resolve({ key: "home" }) };
const call = (origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/pages/home/publish", { method: "POST", headers: { origin } });

describe("/api/admin/pages/[key]/publish", () => {
  it("publishes the page as the admin, and refuses another site's request or no session", async () => {
    stubServerEnv();
    expect(await (await POST(call(), params)).json()).toEqual({
      success: true,
      data: { publishedAt: "2026-10-30T10:00:00.000Z" },
    });
    expect(publishPage).toHaveBeenCalledWith("HOME", expect.objectContaining({ adminId: "admin-1" }));
    expect((await POST(call("https://evil.example"), params)).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await POST(call(), params)).status).toBe(401);
    expect(publishPage).toHaveBeenCalledOnce();
  });
});
