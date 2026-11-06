// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const unstable_cache = vi.fn((read: () => Promise<unknown>) => read);
const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ unstable_cache, revalidateTag }));

const { CACHE_TAGS, cachedRead, publishedTags, revalidateContent } = await import("@/lib/content/cache");

afterEach(() => vi.clearAllMocks());

describe("the cache tags (plan §22.1)", () => {
  it("name what each read shows", () => {
    expect(CACHE_TAGS.document("PAGE:HOME")).toBe("page:HOME");
    expect(CACHE_TAGS.document("SITE")).toBe("site");
    expect(CACHE_TAGS.document("TYPOGRAPHY")).toBe("typography");
    expect(CACHE_TAGS.document("ORDER:SERVICES")).toBe("services");
    expect(CACHE_TAGS.document("ORDER:CLIENTS")).toBe("clients");
    expect(CACHE_TAGS.collection("JOBS")).toBe("jobs");
    expect(CACHE_TAGS.record("SERVICES", "elderly-care")).toBe("service:elderly-care");
    expect(CACHE_TAGS.record("JOBS", "night-nurse")).toBe("job:night-nurse");
    expect(CACHE_TAGS.media).toBe("media");
  });

  it("are exactly what a publish changes", () => {
    expect(publishedTags({ document: "PAGE:ABOUT" })).toEqual(["page:ABOUT"]);
    expect(publishedTags({ collection: "SERVICES", slugs: ["elderly-care", "care-for-older-people", null] })).toEqual([
      "services",
      "service:elderly-care",
      "service:care-for-older-people",
    ]);
  });
});

describe("cachedRead", () => {
  it("keeps a read under its name and arguments, with its tags", async () => {
    const read = vi.fn(async (collection: string, slug: string) => `${collection}/${slug}`);
    const cached = cachedRead("record", read, (collection, slug) => [collection, slug]);
    expect(await cached("SERVICES", "elderly-care")).toBe("SERVICES/elderly-care");
    expect(unstable_cache).toHaveBeenCalledWith(expect.any(Function), ["record", "SERVICES", "elderly-care"], {
      tags: ["SERVICES", "elderly-care"],
    });
  });
});

describe("revalidateContent", () => {
  it("drops each tag once, so the next request reads afresh", () => {
    revalidateContent(["services", "service:elderly-care", "services"]);
    expect(revalidateTag.mock.calls).toEqual([
      ["services", { expire: 0 }],
      ["service:elderly-care", { expire: 0 }],
    ]);
  });
});
