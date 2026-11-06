// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_TYPOGRAPHY } from "@/constants/typography";
import { stubServerEnv } from "@tests/support/env";

const ADMIN = { adminId: "admin-1", email: "admin@alhidaya.qa", name: "Admin" };
const getAdminSession = vi.fn<() => Promise<typeof ADMIN | null>>(async () => ADMIN);
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const getTypographyForAdmin = vi.fn(async () => ({ site: true }));
const saveTypographyDraft = vi.fn(async () => ({ saved: true }));
vi.mock("@/features/settings/typography", () => ({ getTypographyForAdmin, saveTypographyDraft }));

const { GET, PUT } = await import("@/app/api/admin/typography/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/admin/typography", {
    method,
    headers: { origin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/typography", () => {
  it("opens the site's draft, and saves it whole as the admin (D94)", async () => {
    stubServerEnv();
    expect(await (await GET(call("GET"))).json()).toEqual({ success: true, data: { site: true } });
    expect(await (await PUT(call("PUT", DEFAULT_TYPOGRAPHY))).json()).toEqual({ success: true, data: { saved: true } });
    expect(saveTypographyDraft).toHaveBeenCalledWith(
      DEFAULT_TYPOGRAPHY,
      expect.objectContaining({ adminId: "admin-1", requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("refuses what fails its checks, another site's request, and no session", async () => {
    stubServerEnv();
    expect((await PUT(call("PUT", { roles: { ...DEFAULT_TYPOGRAPHY.roles, h1: "unknown" } }))).status).toBe(400);
    expect((await PUT(call("PUT", DEFAULT_TYPOGRAPHY, "https://evil.example"))).status).toBe(403);
    getAdminSession.mockResolvedValueOnce(null);
    expect((await GET(call("GET"))).status).toBe(401);
    expect(saveTypographyDraft).not.toHaveBeenCalled();
  });
});
