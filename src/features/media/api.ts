import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { media } from "@/db/schema";
import { mediaUrl } from "@/lib/storage/media";

import type { SiteImage } from "./types";

/**
 * The images published content refers to, by id (plan §15, §22.3), in one
 * query: each with its made sizes and its words. An id that is not an image
 * (gone, the brochure, or one whose shape is unknown) is left out, and the
 * page shows no photo there rather than one that shifts.
 */
export async function getImages(ids: readonly string[]): Promise<Map<string, SiteImage>> {
  const wanted = [...new Set(ids)];
  if (wanted.length === 0) return new Map();
  const rows = await getDb()
    .select({
      id: media.id,
      variants: media.variants,
      width: media.width,
      height: media.height,
      alt: media.alt,
      decorative: media.decorative,
    })
    .from(media)
    .where(and(inArray(media.id, wanted), eq(media.kind, "IMAGE")));
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
