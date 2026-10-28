/**
 * What may be uploaded where (plan §9.2, §15, §26.5, AGENTS.md §15). A file's
 * type is read from its first bytes (src/lib/storage/file-type.ts), never from
 * its name or the browser's word, and its extension comes from that type.
 */
export const FILE_TYPES = {
  jpeg: { extension: "jpg", mime: "image/jpeg" },
  png: { extension: "png", mime: "image/png" },
  webp: { extension: "webp", mime: "image/webp" },
  avif: { extension: "avif", mime: "image/avif" },
  pdf: { extension: "pdf", mime: "application/pdf" },
  docx: { extension: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  doc: { extension: "doc", mime: "application/msword" },
} as const;

export type FileType = keyof typeof FILE_TYPES;

/** A CV: PDF or Word (plan Q4, D52). */
export const CV_TYPES: readonly FileType[] = ["pdf", "docx", "doc"];

/** An image the admin uploads; SVG is refused (plan §15). */
export const IMAGE_TYPES: readonly FileType[] = ["jpeg", "png", "webp", "avif"];

/** The brochure (plan §12). */
export const BROCHURE_TYPES: readonly FileType[] = ["pdf"];
