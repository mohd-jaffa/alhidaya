import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { AuthClient } from "@/features/auth/api.client";

afterEach(() => vi.unstubAllGlobals());

describe("AuthClient", () => {
  it("signs in and out, asks for a reset link and sets a new password, each at its endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => Response.json({ success: true, data: { done: true } }));
    vi.stubGlobal("fetch", fetch);
    await AuthClient.signIn({ email: "admin@alhidaya.qa", password: "pw" });
    await AuthClient.signOut();
    await AuthClient.requestReset({ email: "admin@alhidaya.qa" });
    await AuthClient.resetPassword({ token: "t", password: "a long new password" });
    expect(fetch.mock.calls.map(([url, init]) => `${(init as RequestInit).method} ${url}`)).toEqual([
      `POST ${ADMIN_API_ROUTES.adminSession}`,
      `DELETE ${ADMIN_API_ROUTES.adminSession}`,
      `POST ${ADMIN_API_ROUTES.passwordForgot}`,
      `POST ${ADMIN_API_ROUTES.passwordReset}`,
    ]);
  });
});
