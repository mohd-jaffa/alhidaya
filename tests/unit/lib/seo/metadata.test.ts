import { afterEach, describe, expect, it, vi } from "vitest";

import { siteMetadataBase } from "@/lib/seo/metadata";

afterEach(() => vi.unstubAllEnvs());

describe("siteMetadataBase", () => {
  it("is the site's own address, or nothing when it is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://alhidaya.qa");
    expect(siteMetadataBase()?.href).toBe("https://alhidaya.qa/");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteMetadataBase()).toBeUndefined();
  });
});
