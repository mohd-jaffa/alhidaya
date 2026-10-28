import { afterEach, describe, expect, it, vi } from "vitest";

import { publicAppVersion, publicSiteUrl } from "@/lib/env/public";

afterEach(() => vi.unstubAllEnvs());

describe("the public environment", () => {
  it("reads the site address and version written at build", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://alhidaya.qa");
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "0.1.0");
    expect(publicSiteUrl()).toBe("https://alhidaya.qa");
    expect(publicAppVersion()).toBe("0.1.0");
  });

  it("reads absent values as empty", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", undefined);
    expect(publicSiteUrl()).toBe("");
    expect(publicAppVersion()).toBe("");
  });
});
