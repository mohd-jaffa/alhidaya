import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { UPLOAD_LIMITS } from "@/constants/limits";
import { PAGE_NAMES } from "@/constants/messages";
import { PAGE_KEYS, type PageKey } from "@/constants/sections";
import { AUDIT_ENTITIES, type RecordCollection } from "@/constants/statuses";
import { BROCHURE_TYPES, FILE_TYPES, IMAGE_TYPES } from "@/constants/uploads";
import { getDb } from "@/db/client";
import { documents, media, type MediaVariant, records } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { logActionSafe } from "@/lib/audit/auditLog";
import { mediaIds } from "@/lib/content/media-ids";
import { captureError } from "@/lib/audit/errorLog";
import type { Actor } from "@/lib/content/actor";
import { CACHE_TAGS, cachedRead, revalidateContent } from "@/lib/content/cache";
import { businessRuleError, notFoundError, validationError } from "@/lib/errors";
import { detectFileType } from "@/lib/storage/file-type";
import { makeImageSizes } from "@/lib/storage/images";
import { deleteMediaFile, mediaKey, mediaUrl, saveMediaFile } from "@/lib/storage/media";
import type { ImageDetailsPayload } from "@/lib/validation";

import type { LibraryImage, MediaUsage, SiteImage } from "./types";

const IMAGE_COLUMNS = {
  id: media.id,
  variants: media.variants,
  width: media.width,
  height: media.height,
  alt: media.alt,
  decorative: media.decorative,
};

type ImageRow = Pick<typeof media.$inferSelect, keyof typeof IMAGE_COLUMNS>;

/** The images' rows, kept until the media library changes (plan §22.1). */
const imageRows = cachedRead(
  "images",
  // The ids, sorted and joined, name the read: the same images are one entry, whichever page asks.
  (ids: string) =>
    getDb()
      .select(IMAGE_COLUMNS)
      .from(media)
      .where(and(inArray(media.id, ids.split(",")), eq(media.kind, "IMAGE"))),
  () => [CACHE_TAGS.media],
);

/** An image row as a page shows it, or null for one whose shape is unknown (it would shift the page). */
function toSiteImage({ id, width, height, alt, decorative, variants }: ImageRow): SiteImage | null {
  if (!width || !height) return null;
  return {
    id,
    width,
    height,
    alt: decorative ? "" : (alt?.en ?? ""),
    sources: variants.flatMap((variant) =>
      variant.width === null ? [] : [{ url: mediaUrl(variant.key), width: variant.width, mime: variant.mime }],
    ),
  };
}

/**
 * The images published content refers to, by id (plan §15, §22.3), in one
 * query: each with its made sizes and its words. An id that is not an image
 * (gone, the brochure, or one whose shape is unknown) is left out, and the
 * page shows no photo there rather than one that shifts.
 */
export async function getImages(ids: readonly string[]): Promise<Map<string, SiteImage>> {
  const wanted = [...new Set(ids)].toSorted();
  if (wanted.length === 0) return new Map();
  const images = new Map<string, SiteImage>();
  for (const row of await imageRows(wanted.join(","))) {
    const image = toSiteImage(row);
    if (image) images.set(image.id, image);
  }
  return images;
}

const RECORD_PLACES: Record<RecordCollection, { label: string; href: (id: string) => string }> = {
  SERVICES: { label: ADMIN_TEXT.services, href: ADMIN_ROUTES.service },
  JOBS: { label: ADMIN_TEXT.jobs, href: ADMIN_ROUTES.job },
  CLIENTS: { label: ADMIN_TEXT.clients, href: ADMIN_ROUTES.client },
};

/** Where a document is edited: a page, or Settings for the site's content; an order holds no file. */
function documentPlace(key: string): MediaUsage | null {
  const page = key.slice(5) as PageKey;
  if (key.startsWith("PAGE:") && PAGE_KEYS.includes(page))
    return { label: `${ADMIN_TEXT.pages} · ${PAGE_NAMES[page]}`, href: ADMIN_ROUTES.page(page) };
  return key === "SITE" ? { label: ADMIN_TEXT.settings, href: ADMIN_ROUTES.settings } : null;
}

/**
 * Where each file is used (plan §15): every page, record and the site's
 * content that names it in its draft or its published copy, archived records
 * included (Restore would bring them back). Read whole, in two queries: the
 * site holds a few dozen of each.
 */
async function mediaUsage(): Promise<Map<string, MediaUsage[]>> {
  const db = getDb();
  const [docs, recs] = await Promise.all([
    db.select({ key: documents.key, draft: documents.draft, published: documents.published }).from(documents),
    db
      .select({ id: records.id, collection: records.collection, draft: records.draft, published: records.published })
      .from(records),
  ]);
  const usage = new Map<string, MediaUsage[]>();
  const add = (copies: unknown[], place: MediaUsage | null) => {
    if (!place) return;
    for (const id of mediaIds(copies)) usage.set(id, [...(usage.get(id) ?? []), place]);
  };
  for (const doc of docs) add([doc.draft, doc.published], documentPlace(doc.key));
  for (const rec of recs) {
    const place = RECORD_PLACES[rec.collection as RecordCollection];
    const draft = rec.draft as { name?: { en?: string }; title?: { en?: string } };
    const name = draft.name?.en ?? draft.title?.en ?? ADMIN_TEXT.unnamed;
    add([rec.draft, rec.published], {
      label: `${place.label} · ${name || ADMIN_TEXT.unnamed}`,
      href: place.href(rec.id),
    });
  }
  return usage;
}

const LIBRARY_COLUMNS = { ...IMAGE_COLUMNS, bytes: media.bytes, source: media.source, createdAt: media.createdAt };
type LibraryRow = Pick<typeof media.$inferSelect, keyof typeof LIBRARY_COLUMNS>;

const toLibraryImage = (row: LibraryRow, usage: Map<string, MediaUsage[]>): LibraryImage[] => {
  const image = toSiteImage(row);
  if (!image) return [];
  return [
    {
      ...image,
      decorative: row.decorative,
      source: row.source,
      bytes: row.bytes,
      createdAt: row.createdAt,
      usedIn: usage.get(row.id) ?? [],
    },
  ];
};

/**
 * The media library's images (plan §15, D89, D93), newest first: each as a
 * page would show it, with its words, its source, its size and where it is
 * used. Never cached: the admin sees an upload at once.
 */
export async function listImagesForAdmin(): Promise<LibraryImage[]> {
  const [rows, usage] = await Promise.all([
    getDb().select(LIBRARY_COLUMNS).from(media).where(eq(media.kind, "IMAGE")).orderBy(desc(media.createdAt), media.id),
    mediaUsage(),
  ]);
  return rows.flatMap((row) => toLibraryImage(row, usage));
}

/** One image of the library, as its list shows it, or a 404. */
export async function getImageForAdmin(id: string): Promise<LibraryImage> {
  const [[row], usage] = await Promise.all([
    getDb()
      .select(LIBRARY_COLUMNS)
      .from(media)
      .where(and(eq(media.id, id), eq(media.kind, "IMAGE"))),
    mediaUsage(),
  ]);
  const [image] = row ? toLibraryImage(row, usage) : [];
  if (!image) throw notFoundError("RECORD_NOT_FOUND");
  return image;
}

/** Uploads an image to the library (plan §15, D93): stored in its sizes, with its words; audited. */
export async function uploadImage(
  bytes: Uint8Array,
  details: ImageDetailsPayload,
  actor: Actor,
): Promise<LibraryImage> {
  const id = await storeImage({ bytes, ...details, createdBy: actor.adminId });
  await logActionSafe({
    actorId: actor.adminId,
    action: "CREATE",
    entityType: AUDIT_ENTITIES.media,
    entityId: id,
    requestId: actor.requestId,
  });
  return getImageForAdmin(id);
}

/** Changes an image's words (D93): every page showing it says them from the next visit. */
export async function updateImageDetails(
  id: string,
  details: ImageDetailsPayload,
  actor: Actor,
): Promise<LibraryImage> {
  const [result] = await getDb()
    .update(media)
    .set({
      alt: details.alt === null ? null : { en: details.alt },
      decorative: details.decorative,
      source: details.source,
      updatedAt: new Date(),
    })
    .where(and(eq(media.id, id), eq(media.kind, "IMAGE")));
  if (result.affectedRows === 0) throw notFoundError("RECORD_NOT_FOUND");
  revalidateContent([CACHE_TAGS.media]);
  await logActionSafe({
    actorId: actor.adminId,
    action: "UPDATE",
    entityType: AUDIT_ENTITIES.media,
    entityId: id,
    requestId: actor.requestId,
  });
  return getImageForAdmin(id);
}

/**
 * Deletes an image and its files (plan §15), asked first in the library;
 * refused, naming each place, while anything names it. A file that will not
 * go is put in the error log; the image is gone either way.
 */
export async function deleteImage(id: string, actor: Actor): Promise<{ deleted: true }> {
  const usedIn = (await mediaUsage()).get(id) ?? [];
  if (usedIn.length > 0) throw businessRuleError("MEDIA_IN_USE", usedIn);
  const db = getDb();
  const [row] = await db
    .select({ variants: media.variants })
    .from(media)
    .where(and(eq(media.id, id), eq(media.kind, "IMAGE")));
  if (!row) throw notFoundError("RECORD_NOT_FOUND");
  await db.delete(media).where(eq(media.id, id));
  revalidateContent([CACHE_TAGS.media]);
  for (const result of await Promise.allSettled(row.variants.map((variant) => deleteMediaFile(variant.key)))) {
    if (result.status === "rejected")
      await captureError({ message: "Media file not deleted", error: result.reason, reference: id });
  }
  await logActionSafe({
    actorId: actor.adminId,
    action: "DELETE",
    entityType: AUDIT_ENTITIES.media,
    entityId: id,
    requestId: actor.requestId,
  });
  return { deleted: true };
}

/** Refuses a content save that names an image the library does not hold as one (plan §15). */
export async function assertImagesKept(ids: readonly string[]): Promise<void> {
  const wanted = [...new Set(ids)];
  if (wanted.length === 0) return;
  const kept = await getDb()
    .select({ id: media.id })
    .from(media)
    .where(and(inArray(media.id, wanted), eq(media.kind, "IMAGE")));
  if (kept.length !== wanted.length) throw validationError("IMAGE_NOT_FOUND");
}

/** Where a stock photo came from (plan Q11, D8, D93): kept with it, never shown as Al Hidaya's own. */
export interface ImageSource {
  provider: string | null;
  url: string | null;
  licence: string | null;
}

/**
 * Keeps an image (plan §15): typed by its first bytes, within its size, made
 * into its sizes once (the original is not kept), each written to the media
 * folder, then its row with its words and, for stock, where it came from. If
 * any step fails, the files already written are removed. Answers its id.
 */
export async function storeImage(input: {
  bytes: Uint8Array;
  /** What it shows; none for an image marked decorative. */
  alt: string | null;
  decorative?: boolean;
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
        alt: input.alt === null ? null : { en: input.alt },
        decorative: input.decorative ?? false,
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

/** A PDF the site serves (plan §12): the brochure, as the admin sees it. */
export interface PdfFile {
  id: string;
  url: string;
  bytes: number;
}

const PDF_COLUMNS = { id: media.id, variants: media.variants, bytes: media.bytes };
const toPdfFile = (row: { id: string; variants: MediaVariant[]; bytes: number }): PdfFile | null =>
  row.variants[0] ? { id: row.id, url: mediaUrl(row.variants[0].key), bytes: row.bytes } : null;

/**
 * Keeps the brochure (plan §12, D94): a PDF by its first bytes, within its
 * size, in the media folder with a name the app makes; answers it. It goes
 * live only when Settings is published.
 */
export async function storeBrochure(bytes: Uint8Array, actor: Actor, at: Date = new Date()): Promise<PdfFile> {
  const type = detectFileType(bytes);
  if (!type || !BROCHURE_TYPES.includes(type)) throw validationError("UPLOAD_TYPE_NOT_ALLOWED");
  if (bytes.byteLength > UPLOAD_LIMITS.brochureBytes) throw validationError("UPLOAD_TOO_LARGE");
  const key = await saveMediaFile({ bytes, type, key: mediaKey(type, at) });
  const id = newId();
  try {
    await getDb()
      .insert(media)
      .values({
        id,
        kind: "PDF",
        variants: [{ key, width: null, mime: FILE_TYPES.pdf.mime, bytes: bytes.byteLength }],
        bytes: bytes.byteLength,
        createdBy: actor.adminId,
        createdAt: at,
        updatedAt: at,
      });
  } catch (error) {
    await deleteMediaFile(key);
    throw error;
  }
  await logActionSafe({
    actorId: actor.adminId,
    action: "CREATE",
    entityType: AUDIT_ENTITIES.media,
    entityId: id,
    requestId: actor.requestId,
  });
  return { id, url: mediaUrl(key), bytes: bytes.byteLength };
}

/** A kept PDF by id, or null for one the library does not hold as a PDF. */
export async function getPdfFile(id: string): Promise<PdfFile | null> {
  const [row] = await getDb()
    .select(PDF_COLUMNS)
    .from(media)
    .where(and(eq(media.id, id), eq(media.kind, "PDF")));
  return row ? toPdfFile(row) : null;
}

/** A kept PDF's address for the public site, kept until the library changes (plan §22.1). */
export const publishedPdfUrl = cachedRead(
  "pdf",
  async (id: string) => (await getPdfFile(id))?.url ?? null,
  () => [CACHE_TAGS.media],
);

/**
 * Deletes every PDF but those named (plan §21.2): a brochure replaced or
 * never published takes no room once Settings no longer names it. A file
 * that will not go is put in the error log.
 */
export async function deleteOtherPdfs(keep: readonly string[], actor: Actor): Promise<void> {
  const db = getDb();
  const rows = await db.select(PDF_COLUMNS).from(media).where(eq(media.kind, "PDF"));
  for (const row of rows.filter((candidate) => !keep.includes(candidate.id))) {
    await db.delete(media).where(eq(media.id, row.id));
    for (const result of await Promise.allSettled(row.variants.map((variant) => deleteMediaFile(variant.key)))) {
      if (result.status === "rejected")
        await captureError({ message: "Media file not deleted", error: result.reason, reference: row.id });
    }
    await logActionSafe({
      actorId: actor.adminId,
      action: "DELETE",
      entityType: AUDIT_ENTITIES.media,
      entityId: row.id,
      requestId: actor.requestId,
    });
  }
}
