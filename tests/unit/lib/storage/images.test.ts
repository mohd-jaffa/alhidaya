// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/constants/messages";
import { makeImageSizes } from "@/lib/storage/images";

/** A photo-like test image: a gradient, with a camera's orientation and location written into it. */
async function photo(width: number, height: number, orientation?: number) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let index = 0; index < pixels.length; index += 3) {
    pixels[index] = (index / 3) % 256;
    pixels[index + 1] = 120;
    pixels[index + 2] = 200;
  }
  return new Uint8Array(
    await sharp(pixels, { raw: { width, height, channels: 3 } })
      .jpeg()
      .withMetadata({ orientation, exif: { IFD0: { Copyright: "camera" } } })
      .toBuffer(),
  );
}

// Encoding AVIF is slow work, slower still beside the other test files.
describe("makeImageSizes", { timeout: 30_000 }, () => {
  it("makes each width up to the original's, in AVIF and WebP, with no metadata kept", async () => {
    const sizes = await makeImageSizes(await photo(1000, 600));
    expect(sizes.map(({ width, type }) => `${type}-${width}`)).toEqual([
      "avif-480",
      "webp-480",
      "avif-800",
      "webp-800",
      "avif-1000",
      "webp-1000",
    ]);
    expect(sizes.find((size) => size.width === 1000)?.height).toBe(600);
    for (const size of sizes) {
      const meta = await sharp(size.bytes).metadata();
      expect(meta.format).toBe(size.type === "avif" ? "heif" : "webp");
      expect(meta.exif).toBeUndefined();
    }
  });

  it("stands a sideways photo upright, and never enlarges a small one", async () => {
    const sideways = await makeImageSizes(await photo(600, 300, 6));
    expect(sideways.at(-1)).toMatchObject({ width: 300, height: 600 });
    expect((await makeImageSizes(await photo(200, 100))).map((size) => size.width)).toEqual([200, 200]);
  });

  it("refuses what is not an image it can read", async () => {
    await expect(makeImageSizes(new TextEncoder().encode("<svg onload=alert(1)>"))).rejects.toThrow(
      ERROR_MESSAGES.UPLOAD_TYPE_NOT_ALLOWED,
    );
  });
});
