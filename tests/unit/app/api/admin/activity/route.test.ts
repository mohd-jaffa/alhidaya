// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listActivity = vi.fn(async () => ({ items: [], total: 0, page: 2, pageSize: 50 }));
vi.mock("@/features/activity/api", () => ({ listActivity }));

const { GET } = await import("@/app/api/admin/activity/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (search = "") => new Request(`http://localhost:3000/api/admin/activity${search}`);

describe("/api/admin/activity", () => {
  it("lists the admin's changes of a kind, a page at a time (D96), and caches nothing", async () => {
    stubServerEnv();
    const answer = await GET(call("?kind=SIGN_INS&page=2"));
    expect(await answer.json()).toEqual({ success: true, data: { items: [], total: 0, page: 2, pageSize: 50 } });
    expect(answer.headers.get("cache-control")).toContain("no-store");
    expect(listActivity).toHaveBeenCalledWith({ kind: "SIGN_INS", page: 2 });
  });

  it("refuses a kind it does not know, and anyone without the admin's session", async () => {
    stubServerEnv();
    expect((await GET(call("?kind=PAGES"))).status).toBe(400);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect(listActivity).not.toHaveBeenCalled();
  });
});
