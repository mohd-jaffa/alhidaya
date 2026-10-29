import sharp from "sharp";

import { UPLOAD_LIMITS } from "@/constants/limits";
import { IMAGE_OUTPUTS, IMAGE_WIDTHS } from "@/constants/uploads";
import { validationError } from "@/lib/errors";

// One image at a time: the server has one core and 1 GB of memory (plan §15, §21.1).
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
  const source = () => sharp(original, { limitInputPixels: UPLOAD_LIMITS.imageMaxPixels, autoOrient: true });
  let width: number;
  try {
    width = (await source().metadata()).autoOrient.width;
  } catch {
    throw validationError("UPLOAD_TYPE_NOT_ALLOWED");
  }
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
}
