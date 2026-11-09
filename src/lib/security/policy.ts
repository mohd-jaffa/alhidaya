/** Headers shared by HTML, API responses and static files (plan §26.3). */
export const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // This host only: other client subdomains have not been reviewed for HSTS.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

/** Scripts need a fresh nonce; inline styles support focal coordinates and GSAP transforms. */
export function contentSecurityPolicy(nonce: string, development: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://static.cloudflareinsights.com${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com${development ? " ws: wss:" : ""}`,
    "frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
