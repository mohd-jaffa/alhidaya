// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const enquirySummaries = vi.fn();
const applicationSummaries = vi.fn();
vi.mock("@/features/enquiries/api", () => ({ enquirySummaries }));
vi.mock("@/features/careers/api", () => ({ applicationSummaries }));
const listArrivals = vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 25 }));
vi.mock("@/lib/inbox/arrivals", () => ({ listArrivals }));

const { GET } = await import("@/app/api/admin/today/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (query = "") => new Request(`http://localhost:3000/api/admin/today${query}`);

describe("GET /api/admin/today", () => {
  it("lists both kinds as one stream for the signed-in admin, each kind's rows its own feature's", async () => {
    stubServerEnv();
    const response = await GET(call("?needsYou=true&page=2"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(listArrivals).toHaveBeenCalledWith(
      { needsYou: true, page: 2 },
      { enquiry: enquirySummaries, application: applicationSummaries },
    );
  });

  it("refuses without the admin's session, and a page it does not know", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call())).status).toBe(401);
    expect((await GET(call("?page=0"))).status).toBe(400);
    expect(listArrivals).not.toHaveBeenCalled();
  });
});
