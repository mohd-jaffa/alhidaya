// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listApplications = vi.fn(async (query: unknown) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 25,
  jobs: [],
  query,
}));
vi.mock("@/features/careers/api", () => ({ listApplications }));

const { GET } = await import("@/app/api/admin/applications/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const JOB = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";
const call = (query = "") => new Request(`http://localhost:3000/api/admin/applications${query}`);

describe("GET /api/admin/applications", () => {
  it("lists for the signed-in admin, by the query's job, status, search and page, kept by no one", async () => {
    stubServerEnv();
    const response = await GET(call(`?job=${JOB}&status=SHORTLISTED&q=%20Mariam%20&page=2`));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(listApplications).toHaveBeenCalledWith({
      job: JOB,
      status: "SHORTLISTED",
      needsYou: false,
      q: "Mariam",
      page: 2,
    });
    await GET(call("?job=general&needsYou=true"));
    expect(listApplications).toHaveBeenLastCalledWith({ job: "general", needsYou: true, q: null, page: 1 });
  });

  it("refuses without the admin's session, and a query it does not know", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect((await GET(call("?status=RESOLVED"))).status).toBe(400);
    expect((await GET(call("?job=nurse"))).status).toBe(400);
    expect(listApplications).not.toHaveBeenCalled();
  });
});
