import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES } from "@/constants/routes";
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
      `POST ${API_ROUTES.adminSession}`,
      `DELETE ${API_ROUTES.adminSession}`,
      `POST ${API_ROUTES.passwordForgot}`,
      `POST ${API_ROUTES.passwordReset}`,
    ]);
  });
});
