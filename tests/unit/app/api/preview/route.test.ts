// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const enable = vi.fn();
const getAdminSession = vi.fn();
vi.mock("next/headers", () => ({ draftMode: async () => ({ enable }) }));
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { GET } = await import("@/app/api/preview/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (query = "") => new Request(`http://localhost:3000/api/preview${query}`);
const ADMIN = { adminId: "a1", email: "admin@alhidaya.qa", name: "Admin" };

describe("GET /api/preview", () => {
  it("turns the preview on for the signed-in admin and opens the page asked for, or Home", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue(ADMIN);
    const response = await GET(call("?path=%2Fservices%2Felderly-care"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/services/elderly-care");
    expect(enable).toHaveBeenCalledTimes(1);
    expect((await GET(call())).headers.get("location")).toBe("/");
  });

  it("refuses anyone without the admin's session", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue(null);
    const response = await GET(call("?path=%2F"));
    expect(response.status).toBe(401);
    expect(enable).not.toHaveBeenCalled();
  });

  it("opens nothing but a page of the public site", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue(ADMIN);
    for (const path of ["https://evil.example", "//evil.example", "/admin", "/api/preview", "javascript:alert(1)"]) {
      const response = await GET(call(`?path=${encodeURIComponent(path)}`));
      expect(response.status, path).toBe(400);
    }
    expect(enable).not.toHaveBeenCalled();
  });
});
