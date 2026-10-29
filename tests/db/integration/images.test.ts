import { inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { media, type MediaVariant } from "@/db/schema";
import { getImages } from "@/features/media/api";

const ids: string[] = [];

async function stored(row: Partial<typeof media.$inferInsert>) {
  const id = crypto.randomUUID();
  ids.push(id);
  await getDb()
    .insert(media)
    .values({ id, kind: "IMAGE", variants: [], width: 1600, height: 1067, bytes: 1, alt: null, ...row });
  return id;
}

const variant = (key: string, width: number | null, mime: string): MediaVariant => ({ key, width, mime, bytes: 1 });

afterAll(async () => {
  await getDb().delete(media).where(inArray(media.id, ids));
  await closeDb();
});

describe("the images a page refers to, against the local MySQL", () => {
  it("answers each image's made sizes, shape and words in one read", async () => {
    const nurse = await stored({
      variants: [variant("2026-10/abcdefghij-w640.avif", 640, "image/avif"), variant("2026-10/x.pdf", null, "x")],
      alt: { en: "A nurse at a patient's bedside" },
    });
    const pattern = await stored({ decorative: true, alt: { en: "ignored" } });

    const images = await getImages([nurse, pattern, nurse]);
    expect(images.get(nurse)).toEqual({
      id: nurse,
      width: 1600,
      height: 1067,
      alt: "A nurse at a patient's bedside",
      sources: [{ url: "/media/2026-10/abcdefghij-w640.avif", width: 640, mime: "image/avif" }],
    });
    expect(images.get(pattern)?.alt).toBe("");
  });

  it("leaves out what is not a whole image: a PDF, one without its shape, one that is gone", async () => {
    const brochure = await stored({ kind: "PDF", width: null, height: null });
    const shapeless = await stored({ height: null });
    const unnamed = await stored({});
    const images = await getImages([brochure, shapeless, unnamed, crypto.randomUUID()]);
    expect([...images.keys()]).toEqual([unnamed]);
    expect(images.get(unnamed)?.alt).toBe("");
  });

  it("asks nothing when the page has no images", async () => {
    expect(await getImages([])).toEqual(new Map());
  });
});
