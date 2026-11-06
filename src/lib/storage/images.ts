import sharp from "sharp";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { IMAGE_OUTPUTS, IMAGE_WIDTHS } from "@/constants/uploads";
import { validationError } from "@/lib/errors";

// Bound libvips worker threads per pipeline on the one-core server (plan §15, §21.1).
sharp.concurrency(1);

export interface MadeSize {
  width: number;
  height: number;
  type: (typeof IMAGE_OUTPUTS)[number]["type"];
  bytes: Uint8Array;
}

/**
 * The sizes an image is kept at (plan §15, §22.3), made once: upright, its
 * metadata gone (where and when a photo was taken stays with the photo), at
 * each width up to the original's, never enlarged, in AVIF and WebP. The
 * original itself is not kept. Untrusted input: decoding is bounded and any
 * damage refuses the file.
 */
export async function makeImageSizes(original: Uint8Array): Promise<MadeSize[]> {
  const source = () =>
    sharp(original, { limitInputPixels: UPLOAD_LIMITS.imageMaxPixels, autoOrient: true, failOn: "warning" });
  try {
    const width = (await source().metadata()).autoOrient.width;
    const widths = new Set([
      ...IMAGE_WIDTHS.filter((candidate) => candidate < width),
      Math.min(width, UPLOAD_LIMITS.imageMaxWidth),
    ]);

    const sizes: MadeSize[] = [];
    for (const target of widths) {
      for (const { type, quality } of IMAGE_OUTPUTS) {
        const { data, info } = await source()
          .resize({ width: target, withoutEnlargement: true })
          .toFormat(type, { quality })
          .toBuffer({ resolveWithObject: true });
        sizes.push({ width: info.width, height: info.height, type, bytes: new Uint8Array(data) });
      }
    }
    return sizes;
  } catch {
    // A readable header does not prove that the pixels can be safely decoded.
    // Reject failures in any output conversion before a single variant is stored.
    throw validationError("UPLOAD_TYPE_NOT_ALLOWED");
  }
}
