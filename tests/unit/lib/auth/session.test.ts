// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
vi.mock("@/lib/auth/auth", () => ({ getAuth: () => ({ api: { getSession } }) }));

const { getAdminSession } = await import("@/lib/auth/session");

describe("getAdminSession", () => {
  it("names the signed-in admin, or no one", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "a1", email: "admin@alhidaya.qa", name: "Admin" }, session: {} });
    expect(await getAdminSession(new Headers())).toEqual({ adminId: "a1", email: "admin@alhidaya.qa", name: "Admin" });
    getSession.mockResolvedValueOnce(null);
    expect(await getAdminSession(new Headers())).toBeNull();
  });
});
