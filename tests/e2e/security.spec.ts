import { expect, test } from "@playwright/test";

import { JSON_BODY_LIMITS } from "@/constants/limits";
import { SECURITY_HEADERS } from "@/lib/security/policy";
import { E2E_ORIGIN } from "@tests/support/e2e-app";

test("HTML policies use fresh nonces, protect error/admin pages and block injected scripts", async ({
  page,
  request,
}) => {
  let previous = "";
  for (const path of ["/", "/about", "/contact", "/admin/login", "/missing-security-page"]) {
    const response = await page.goto(path);
    expect(response).not.toBeNull();
    const headers = response!.headers();
    for (const { key, value } of SECURITY_HEADERS) expect(headers[key.toLowerCase()], `${path}: ${key}`).toBe(value);
    const policy = headers["content-security-policy"];
    const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce).toBeTruthy();
    expect(nonce).not.toBe(previous);
    previous = nonce!;
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-(eval|inline)'/);
    const scripts = await page
      .locator("script:not([type='application/ld+json'])")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({ nonce: (node as HTMLScriptElement).nonce, src: (node as HTMLScriptElement).src })),
      );
    expect(scripts.length).toBeGreaterThan(0);
    for (const script of scripts.filter((script) => !script.src)) expect(script.nonce).toBe(nonce);
  }
  // DevTools evaluation bypasses CSP. Inject into the actual HTTP document instead,
  // so the browser parser applies the app's original response policy to hostile HTML.
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { securityViolations: violations });
    document.addEventListener("securitypolicyviolation", (event) => violations.push(event.effectiveDirective));
  });
  await page.route(
    (url) => url.searchParams.has("security-probe"),
    async (route) => {
      const original = await route.fetch();
      const body = (await original.text()).replace(
        "<head>",
        '<head><script id="injection-probe">document.documentElement.dataset.injected = "yes"</script>',
      );
      await route.fulfill({ response: original, body });
    },
  );
  await page.goto("/?security-probe=1");
  await expect(page.locator("#injection-probe")).toHaveCount(1);
  expect(await page.locator("html").getAttribute("data-injected")).toBeNull();
  await expect
    .poll(() => page.evaluate(() => (window as Window & { securityViolations?: string[] }).securityViolations))
    .toContain("script-src-elem");
  const response = await request.get("/api/admin/today");
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("oversized public JSON fails before validation, auth or persistence", async ({ request }) => {
  for (const [route, size] of [
    ["/api/enquiries", JSON_BODY_LIMITS.enquiry],
    ["/api/admin/session", JSON_BODY_LIMITS.auth],
  ] as const) {
    const response = await request.post(route, {
      headers: { origin: E2E_ORIGIN, "content-type": "application/json" },
      data: JSON.stringify({ name: "x".repeat(size) }),
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ success: false, error: { code: "REQUEST_TOO_LARGE" } });
    expect(response.headers()["cache-control"]).toBe("no-store");
  }
});
