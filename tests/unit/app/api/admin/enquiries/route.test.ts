// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listEnquiries = vi.fn(async (query: unknown) => ({ items: [], total: 0, page: 1, pageSize: 25, query }));
vi.mock("@/features/enquiries/api", () => ({ listEnquiries }));

const { GET } = await import("@/app/api/admin/enquiries/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (query = "") => new Request(`http://localhost:3000/api/admin/enquiries${query}`);

describe("GET /api/admin/enquiries", () => {
  it("lists for the signed-in admin, by the query's form, status, search and page, kept by no one", async () => {
    stubServerEnv();
    const response = await GET(call("?form=QUOTE&status=NEW&q=%20Mariam%20&page=2"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(listEnquiries).toHaveBeenCalledWith({ form: "QUOTE", status: "NEW", q: "Mariam", page: 2 });
    await GET(call());
    expect(listEnquiries).toHaveBeenLastCalledWith({ q: null, page: 1 });
  });

  it("refuses without the admin's session, and a query it does not know", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect((await GET(call("?status=ARCHIVED"))).status).toBe(400);
    expect((await GET(call("?page=0"))).status).toBe(400);
    expect(listEnquiries).not.toHaveBeenCalled();
  });
});
