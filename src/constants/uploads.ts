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

/** The widths an image is made at once, at upload (plan §15, §22.3); the largest is the one kept largest. */
export const IMAGE_WIDTHS = [480, 800, 1200, 1600, 2400] as const;

/** The types an image is made in, the smallest files first, each at its quality (plan §15). */
export const IMAGE_OUTPUTS = [
  { type: "avif", quality: 50 },
  { type: "webp", quality: 78 },
] as const satisfies readonly { type: FileType; quality: number }[];

/** The brochure (plan §12). */
export const BROCHURE_TYPES: readonly FileType[] = ["pdf"];
