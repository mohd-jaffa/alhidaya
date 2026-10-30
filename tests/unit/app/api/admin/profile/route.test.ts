// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubServerEnv } from "@tests/support/env";

const renameAdmin = vi.fn();
const getAdminSession = vi.fn();
vi.mock("@/features/auth/api", () => ({ renameAdmin }));
vi.mock("@/lib/auth/session", () => ({ getAdminSession }));
vi.mock("@/lib/audit/errorLog", () => ({ captureError: vi.fn() }));

const { GET, PATCH } = await import("@/app/api/admin/profile/route");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const call = (method: string, body?: unknown) =>
  new Request("http://localhost:3000/api/admin/profile", {
    method,
    headers: { origin: "http://localhost:3000", "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("/api/admin/profile (D115)", () => {
  it("answers the signed-in admin's name and email", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a1", email: "admin@alhidaya.qa", name: "Mariam" });
    const response = await GET(call("GET"));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ name: "Mariam", email: "admin@alhidaya.qa" });
  });

  it("renames the admin with a tidied name, and refuses an empty one", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue({ adminId: "a1", email: "admin@alhidaya.qa", name: "Mariam" });
    const response = await PATCH(call("PATCH", { name: "  Mariam   Ali " }));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual({ name: "Mariam Ali", email: "admin@alhidaya.qa" });
    expect(renameAdmin).toHaveBeenCalledWith(expect.any(Headers), "a1", "Mariam Ali", expect.stringMatching(/^req_/));

    expect((await PATCH(call("PATCH", { name: " " }))).status).toBe(400);
    expect(renameAdmin).toHaveBeenCalledTimes(1);
  });

  it("refuses without a session", async () => {
    stubServerEnv();
    getAdminSession.mockResolvedValue(null);
    expect((await GET(call("GET"))).status).toBe(401);
    expect((await PATCH(call("PATCH", { name: "Mariam" }))).status).toBe(401);
    expect(renameAdmin).not.toHaveBeenCalled();
  });
});
