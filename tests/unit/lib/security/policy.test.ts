import { describe, expect, it } from "vitest";

import { contentSecurityPolicy, SECURITY_HEADERS } from "@/lib/security/policy";

describe("browser security policy", () => {
  it("denies framing and unsafe scripts while allowing the known integrations", () => {
    const production = contentSecurityPolicy("random", false);
    expect(production).toContain("script-src 'self' 'nonce-random' 'strict-dynamic'");
    expect(production).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);
    for (const directive of ["object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'self'"])
      expect(production).toContain(directive);
    expect(production).toContain("https://challenges.cloudflare.com");
    expect(production).toContain("https://www.google.com");
    expect(production).not.toContain(" ws:");
    expect(contentSecurityPolicy("random", true)).toContain(" ws: wss:");
    expect(contentSecurityPolicy("random", true)).toContain("'unsafe-eval'");
  });

  it("sets no-sniff, referrer, feature, frame and host-only transport policies", () => {
    expect(Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key, value]))).toEqual({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000",
    });
  });
});
