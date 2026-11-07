// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const unstable_cache = vi.fn<
  (read: () => Promise<unknown>, keys: string[], options: { tags: string[] }) => () => Promise<unknown>
>((read) => read);
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
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ["record", "SERVICES", "elderly-care", "SERVICES:0", "elderly-care:0"],
      {
        tags: ["SERVICES", "elderly-care"],
      },
    );
  });

  it("preserves publish revisions across route-module reloads", async () => {
    revalidateContent(["reload-test"]);
    vi.resetModules();
    const reloaded = await import("@/lib/content/cache");
    await reloaded.cachedRead(
      "reload",
      async () => "fresh",
      () => ["reload-test"],
    )();
    expect(unstable_cache).toHaveBeenLastCalledWith(expect.any(Function), ["reload", "reload-test:1"], {
      tags: ["reload-test"],
    });
  });

  it("reads fresh after publish even when framework invalidation misses, without evicting unrelated tags", async () => {
    const entries = new Map<string, unknown>();
    unstable_cache.mockImplementation((read, keys) => async () => {
      const key = JSON.stringify(keys);
      if (!entries.has(key)) entries.set(key, await read());
      return entries.get(key);
    });
    let value = "old";
    const read = vi.fn(async () => value);
    const cached = cachedRead("clock-repro", read, () => ["clock-test"]);
    const otherRead = vi.fn(async () => "other");
    const other = cachedRead("other-repro", otherRead, () => ["other-test"]);
    const clock = vi.spyOn(Date, "now").mockReturnValue(1000);
    try {
      expect(await cached()).toBe("old");
      expect(await other()).toBe("other");
      value = "new";
      expect(await cached()).toBe("old");
      clock.mockReturnValue(-1000);
      revalidateContent(["clock-test", "clock-test"]);
      expect(await cached()).toBe("new");
      expect(await other()).toBe("other");
      expect(otherRead).toHaveBeenCalledTimes(1);
      value = "newest";
      revalidateContent(["clock-test"]);
      expect(await cached()).toBe("newest");
      expect(read).toHaveBeenCalledTimes(3);
    } finally {
      clock.mockRestore();
      unstable_cache.mockImplementation((read) => read);
    }
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
