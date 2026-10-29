import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));
vi.mock("@/features/content/api", () => ({
  listPublicPaths: vi.fn(async () => [
    { path: "/" },
    { path: "/services/elderly-care", modified: new Date("2026-10-29T09:00:00Z") },
  ]),
}));

const { default: sitemap } = await import("@/app/sitemap");

afterEach(() => vi.unstubAllEnvs());

describe("sitemap.xml", () => {
  it("lists each public page at the site's address, with when a record was published", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://alhidaya.qa");
    expect(await sitemap()).toEqual([
      { url: "https://alhidaya.qa" },
      { url: "https://alhidaya.qa/services/elderly-care", lastModified: new Date("2026-10-29T09:00:00Z") },
    ]);
  });
});
