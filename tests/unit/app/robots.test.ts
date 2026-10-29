import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";

afterEach(() => vi.unstubAllEnvs());

describe("robots.txt", () => {
  it("opens the public site and points to the sitemap, never the admin, the API or the kit", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://alhidaya.qa");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/kit"] },
      sitemap: "https://alhidaya.qa/sitemap.xml",
    });
  });
});
