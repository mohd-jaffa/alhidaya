import type { FileType } from "@/constants/uploads";

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, at) => bytes[offset + at] === byte);

const ascii = (text: string) => Array.from(text, (character) => character.charCodeAt(0));

/** Whether a byte sequence appears anywhere in the file. */
function contains(bytes: Uint8Array, text: string): boolean {
  const needle = ascii(text);
  outer: for (let at = 0; at <= bytes.length - needle.length; at++) {
    for (let index = 0; index < needle.length; index++) if (bytes[at + index] !== needle[index]) continue outer;
    return true;
  }
  return false;
}

/**
 * A file's real type, read from its first bytes (plan §26.5): never from its
 * name, never from the browser's word. Anything not recognised, SVG and
 * every script included, is null and refused.
 */
export function detectFileType(bytes: Uint8Array): FileType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return "webp";
  if (
    startsWith(bytes, ascii("ftyp"), 4) &&
    (startsWith(bytes, ascii("avif"), 8) || startsWith(bytes, ascii("avis"), 8))
  ) {
    return "avif";
  }
  if (startsWith(bytes, ascii("%PDF-"))) return "pdf";
  // A Word document is a zip holding word/document.xml; any other zip is not one.
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) && contains(bytes, "word/document.xml")) return "docx";
  // The older Word format: an OLE2 compound file.
  if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return "doc";
  return null;
}
