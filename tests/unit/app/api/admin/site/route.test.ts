// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { SEED_SITE } from "@/db/seed/content";
import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const getSiteForAdmin = vi.fn(async () => ({ site: true }));
const saveSiteDraft = vi.fn(async () => ({ saved: true }));
vi.mock("@/features/settings/api", () => ({ getSiteForAdmin, saveSiteDraft }));

const { GET, PUT } = await import("@/app/api/admin/site/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/site", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/site", () => {
  it("opens the site's draft, and saves it whole as the admin (D94)", async () => {
    stubServerEnv();
    expect(await (await GET(call("GET"))).json()).toEqual({ success: true, data: { site: true } });
    expect(await (await PUT(call("PUT", SEED_SITE))).json()).toEqual({ success: true, data: { saved: true } });
    expect(saveSiteDraft).toHaveBeenCalledWith(
      SEED_SITE,
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses what fails its checks, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await PUT(call("PUT", { ...SEED_SITE, seo: null }))).status).toBe(400);
    expect((await PUT(call("PUT", SEED_SITE, "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"))).status).toBe(401);
    expect(saveSiteDraft).not.toHaveBeenCalled();
  });
});
