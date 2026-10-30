// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const getBrochureUrl = vi.fn<() => Promise<string | null>>();
vi.mock("@/features/settings/api", () => ({ getBrochureUrl }));

const { GET } = await import("@/app/brochure/route");

describe("/brochure (plan §12, D94)", () => {
  it("sends a visitor on to the published brochure, and answers 404 while there is none", async () => {
    getBrochureUrl.mockResolvedValueOnce("/media/2026-10/abcdefghij.pdf");
    const found = await GET();
    expect([found.status, found.headers.get("location"), found.headers.get("cache-control")]).toEqual([
      307,
      "/media/2026-10/abcdefghij.pdf",
      "no-store",
    ]);
    getBrochureUrl.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(404);
  });
});
