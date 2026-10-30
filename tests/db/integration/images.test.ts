import fs from "node:fs/promises";
import path from "node:path";

import { inArray } from "drizzle-orm";
import sharp from "sharp";
import { afterAll, describe, expect, it } from "vitest";

import { closeDb, getDb } from "@/db/client";
import { media, type MediaVariant } from "@/db/schema";
import { ERROR_MESSAGES } from "@/constants/messages";
import { assertImagesKept, findImageBySource, getImages, listImagesForAdmin, storeImage } from "@/features/media/api";
import { getServerEnv } from "@/lib/env/server";
import { deleteMediaFile } from "@/lib/storage/media";

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
  // The files a stored image wrote go with its row.
  const rows = await getDb().select({ variants: media.variants }).from(media).where(inArray(media.id, ids));
  await Promise.all(rows.flatMap((row) => row.variants.map((variant) => deleteMediaFile(variant.key).catch(() => {}))));
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

const SOURCE = {
  provider: "Unsplash (test)",
  url: `https://unsplash.com/photos/test-${crypto.randomUUID()}`,
  licence: "Unsplash License",
};
const jpeg = async (width: number, height: number) =>
  new Uint8Array(
    await sharp({ create: { width, height, channels: 3, background: "#33a0da" } })
      .jpeg()
      .toBuffer(),
  );
const exists = (key: string) =>
  fs.access(path.join(getServerEnv().MEDIA_DIR, key)).then(
    () => true,
    () => false,
  );

describe("storeImage, against the local MySQL and the media folder", () => {
  it("keeps an image in its made sizes, with its words and where it came from, found again by its source", async () => {
    const id = await storeImage({
      bytes: await jpeg(900, 600),
      alt: "A nurse at home",
      source: SOURCE,
      createdBy: null,
    });
    ids.push(id);
    const [row] = await getDb()
      .select()
      .from(media)
      .where(inArray(media.id, [id]));
    expect(row).toMatchObject({
      kind: "IMAGE",
      width: 900,
      height: 600,
      alt: { en: "A nurse at home" },
      source: SOURCE,
    });
    expect(row.variants.map((variant) => `${variant.mime} ${variant.width}`)).toEqual([
      "image/avif 480",
      "image/webp 480",
      "image/avif 800",
      "image/webp 800",
      "image/avif 900",
      "image/webp 900",
    ]);
    expect(row.bytes).toBe(row.variants.reduce((sum, variant) => sum + variant.bytes, 0));
    for (const variant of row.variants) expect(await exists(variant.key)).toBe(true);
    expect(await findImageBySource(SOURCE.url)).toBe(id);
    expect(await findImageBySource("https://unsplash.com/photos/never-kept")).toBeNull();
  });

  it("refuses what is not an image, or too large, before making anything", async () => {
    await expect(
      storeImage({ bytes: new TextEncoder().encode("%PDF-1.7"), alt: "x", source: null, createdBy: null }),
    ).rejects.toThrow(ERROR_MESSAGES.UPLOAD_TYPE_NOT_ALLOWED);
    await expect(
      storeImage({ bytes: new TextEncoder().encode("<svg/>"), alt: "x", source: null, createdBy: null }),
    ).rejects.toThrow(ERROR_MESSAGES.UPLOAD_TYPE_NOT_ALLOWED);
    const huge = new Uint8Array(10 * 1024 * 1024 + 1);
    huge.set([0xff, 0xd8, 0xff]);
    await expect(storeImage({ bytes: huge, alt: "x", source: null, createdBy: null })).rejects.toThrow(
      ERROR_MESSAGES.UPLOAD_TOO_LARGE,
    );
  });

  it("removes the files it wrote when the row cannot be kept", async () => {
    const before = await fs.readdir(getServerEnv().MEDIA_DIR, { recursive: true });
    // An admin who does not exist: the database refuses the row.
    await expect(
      storeImage({ bytes: await jpeg(500, 300), alt: "x", source: null, createdBy: crypto.randomUUID() }),
    ).rejects.toThrow();
    expect((await fs.readdir(getServerEnv().MEDIA_DIR, { recursive: true })).toSorted()).toEqual(before.toSorted());
  });
});

describe("the library's images for the admin, against the local MySQL", () => {
  it("lists every whole image newest first, marked decorative where it is, and leaves out the rest (D89)", async () => {
    const older = await stored({
      variants: [variant("2026-10/older-w640.webp", 640, "image/webp")],
      alt: { en: "Older" },
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });
    const newer = await stored({
      variants: [variant("2026-10/newer-w640.webp", 640, "image/webp")],
      decorative: true,
      createdAt: new Date("2026-12-01T00:00:00Z"),
    });
    const shapeless = await stored({ width: null, height: null });
    const brochure = await stored({ kind: "PDF", width: null, height: null });

    const listed = (await listImagesForAdmin()).filter((image) => ids.includes(image.id));
    expect(listed.map((image) => image.id)).toEqual(expect.arrayContaining([newer, older]));
    expect(listed.findIndex((image) => image.id === newer)).toBeLessThan(
      listed.findIndex((image) => image.id === older),
    );
    expect(listed.find((image) => image.id === newer)).toMatchObject({ alt: "", decorative: true });
    expect(listed.find((image) => image.id === older)).toMatchObject({ alt: "Older", decorative: false });
    expect(listed.map((image) => image.id)).not.toContain(shapeless);
    expect(listed.map((image) => image.id)).not.toContain(brochure);
  });

  it("accepts a save naming only images the library holds, and refuses any other", async () => {
    const kept = await stored({});
    const brochure = await stored({ kind: "PDF", width: null, height: null });
    await expect(assertImagesKept([])).resolves.toBeUndefined();
    await expect(assertImagesKept([kept, kept])).resolves.toBeUndefined();
    await expect(assertImagesKept([kept, crypto.randomUUID()])).rejects.toMatchObject({ code: "IMAGE_NOT_FOUND" });
    await expect(assertImagesKept([brochure])).rejects.toMatchObject({
      code: "IMAGE_NOT_FOUND",
      message: ERROR_MESSAGES.IMAGE_NOT_FOUND,
    });
  });
});
