import { expect, test } from "@playwright/test";

import { ERROR_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES } from "@/constants/routes";

import { E2E_ORIGIN } from "@tests/support/e2e-app";

const SESSION = "/api/admin/session";

test.describe("without the admin's session", () => {
  test("an admin page sends the visitor to sign in, keeping where they were headed", async ({ request }) => {
    for (const path of [ADMIN_ROUTES.overview, `${ADMIN_ROUTES.enquiries}?status=NEW`, ADMIN_ROUTES.applications]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      const location = new URL(response.headers().location, E2E_ORIGIN);
      expect(location.pathname).toBe(ADMIN_ROUTES.login);
      expect(location.searchParams.get("next")).toBe(path);
    }
  });

  test("the admin API refuses, whatever cookie is sent, and caches nothing", async ({ request }) => {
    for (const cookie of [undefined, "alhidaya.session_token=forged.value"]) {
      const response = await request.delete(SESSION, {
        headers: { origin: E2E_ORIGIN, ...(cookie ? { cookie } : {}) },
      });
      expect(response.status()).toBe(401);
      expect(response.headers()["cache-control"]).toContain("no-store");
      expect(await response.json()).toMatchObject({
        success: false,
        error: { code: "AUTH_SESSION_REQUIRED", message: ERROR_MESSAGES.AUTH_SESSION_REQUIRED },
      });
    }
  });

  test("a write from another site is refused before anything else", async ({ request }) => {
    const response = await request.post(SESSION, {
      headers: { origin: "https://example.com" },
      data: { email: "admin@alhidaya.qa", password: "not-the-password" },
    });
    expect(response.status()).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: "REQUEST_ORIGIN_REFUSED" } });
  });
});
