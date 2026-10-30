// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";
import { serviceFixture } from "@tests/support/fixtures/content";
const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const listServicesForAdmin = vi.fn(async () => ({ listed: true }));
const createService = vi.fn(async () => ({ id: "new" }));
vi.mock("@/features/services/api", () => ({ listServicesForAdmin, createService }));

const { GET, POST } = await import("@/app/api/admin/services/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/services", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/services", () => {
  it("lists them for the admin, and makes a new one as a draft (D92)", async () => {
    stubServerEnv();
    expect(await (await GET(call("GET"))).json()).toEqual({ success: true, data: { listed: true } });
    const document = serviceFixture();
    const made = await POST(call("POST", document));
    expect(made.status).toBe(201);
    expect(await made.json()).toEqual({ success: true, data: { id: "new" } });
    expect(createService).toHaveBeenCalledWith(
      document,
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses what fails its checks, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await POST(call("POST", { ...serviceFixture(), slug: "Not An Address" }))).status).toBe(400);
    expect((await POST(call("POST", serviceFixture(), "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"))).status).toBe(401);
    expect(createService).not.toHaveBeenCalled();
    expect(listServicesForAdmin).not.toHaveBeenCalled();
  });
});
