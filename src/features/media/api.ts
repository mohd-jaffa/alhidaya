import { and, eq, inArray, sql } from "drizzle-orm";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { FILE_TYPES, IMAGE_TYPES } from "@/constants/uploads";
import { getDb } from "@/db/client";
import { media, type MediaVariant } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { CACHE_TAGS, cachedRead } from "@/lib/content/cache";
import { validationError } from "@/lib/errors";
import { detectFileType } from "@/lib/storage/file-type";
import { makeImageSizes } from "@/lib/storage/images";
import { deleteMediaFile, mediaKey, mediaUrl, saveMediaFile } from "@/lib/storage/media";

import type { SiteImage } from "./types";

/** The images' rows, kept until the media library changes (plan §22.1). */
const imageRows = cachedRead(
  "images",
  // The ids, sorted and joined, name the read: the same images are one entry, whichever page asks.
  (ids: string) =>
    getDb()
      .select({
        id: media.id,
        variants: media.variants,
        width: media.width,
        height: media.height,
        alt: media.alt,
        decorative: media.decorative,
      })
      .from(media)
      .where(and(inArray(media.id, ids.split(",")), eq(media.kind, "IMAGE"))),
  () => [CACHE_TAGS.media],
);

/**
 * The images published content refers to, by id (plan §15, §22.3), in one
 * query: each with its made sizes and its words. An id that is not an image
 * (gone, the brochure, or one whose shape is unknown) is left out, and the
 * page shows no photo there rather than one that shifts.
 */
export async function getImages(ids: readonly string[]): Promise<Map<string, SiteImage>> {
  const wanted = [...new Set(ids)].toSorted();
  if (wanted.length === 0) return new Map();
  const rows = await imageRows(wanted.join(","));
  const images = new Map<string, SiteImage>();
  for (const { id, width, height, alt, decorative, variants } of rows) {
    if (!width || !height) continue;
    images.set(id, {
      id,
      width,
      height,
      alt: decorative ? "" : (alt?.en ?? ""),
      sources: variants.flatMap((variant) =>
        variant.width === null ? [] : [{ url: mediaUrl(variant.key), width: variant.width, mime: variant.mime }],
      ),
    });
  }
  return images;
}

/** Where a stock photo came from (plan Q11, D8): kept with it, never shown as Al Hidaya's own. */
export interface ImageSource {
  provider: string;
  url: string;
  licence: string;
}

/**
 * Keeps an image (plan §15): typed by its first bytes, within its size, made
 * into its sizes once (the original is not kept), each written to the media
 * folder, then its row with its words and, for stock, where it came from. If
 * any step fails, the files already written are removed. Answers its id.
 */
export async function storeImage(input: {
  bytes: Uint8Array;
  alt: string;
  source: ImageSource | null;
  createdBy: string | null;
  at?: Date;
}): Promise<string> {
  const { bytes, at = new Date() } = input;
  const type = detectFileType(bytes);
  if (!type || !IMAGE_TYPES.includes(type)) throw validationError("UPLOAD_TYPE_NOT_ALLOWED");
  if (bytes.byteLength > UPLOAD_LIMITS.imageBytes) throw validationError("UPLOAD_TOO_LARGE");

  const sizes = await makeImageSizes(bytes);
  const variants: MediaVariant[] = [];
  try {
    for (const size of sizes) {
      const key = await saveMediaFile({
        bytes: size.bytes,
        type: size.type,
        key: mediaKey(size.type, at, `w${size.width}`),
      });
      variants.push({ key, width: size.width, mime: FILE_TYPES[size.type].mime, bytes: size.bytes.byteLength });
    }
    const largest = sizes.reduce((wide, size) => (size.width > wide.width ? size : wide));
    const id = newId();
    await getDb()
      .insert(media)
      .values({
        id,
        kind: "IMAGE",
        variants,
        width: largest.width,
        height: largest.height,
        bytes: variants.reduce((sum, variant) => sum + variant.bytes, 0),
        alt: { en: input.alt },
        decorative: false,
        source: input.source,
        createdBy: input.createdBy,
        createdAt: at,
        updatedAt: at,
      });
    return id;
  } catch (error) {
    await Promise.all(variants.map((variant) => deleteMediaFile(variant.key)));
    throw error;
  }
}

/** An image kept from a source before (plan Q11): the seed imports each stock photograph once. */
export async function findImageBySource(url: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: media.id })
    .from(media)
    .where(and(eq(media.kind, "IMAGE"), sql`json_unquote(json_extract(${media.source}, '$.url')) = ${url}`))
    .limit(1);
  return row?.id ?? null;
}
