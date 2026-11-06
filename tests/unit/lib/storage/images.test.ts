// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { UPLOAD_LIMITS } from "@/constants/limits";
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
  it("refuses images with readable headers but truncated pixel data", async () => {
    const original = await photo(200, 100);
    const truncated = original.slice(0, Math.floor(original.length * 0.75));
    expect((await sharp(truncated).metadata()).width).toBe(200);
    await expect(makeImageSizes(truncated)).rejects.toMatchObject({ code: "UPLOAD_TYPE_NOT_ALLOWED" });
  });

  it("rejects excessive decoded dimensions before allocating the pixels", async () => {
    const original = Buffer.from(await photo(10, 10));
    const frame = original.indexOf(Buffer.from([0xff, 0xc0]));
    expect(frame).toBeGreaterThan(0);
    original.writeUInt16BE(65_535, frame + 5);
    original.writeUInt16BE(65_535, frame + 7);
    expect(65_535 ** 2).toBeGreaterThan(UPLOAD_LIMITS.imageMaxPixels);
    await expect(makeImageSizes(original)).rejects.toMatchObject({ code: "UPLOAD_TYPE_NOT_ALLOWED" });
  });

  it("re-encodes a real image and discards appended program text", async () => {
    const payload = Buffer.from("<?php echo 'upload-payload-test'; ?>");
    const original = Buffer.concat([await photo(10, 10), payload]);
    for (const size of await makeImageSizes(original)) {
      expect(Buffer.from(size.bytes).includes(payload)).toBe(false);
      expect((await sharp(size.bytes).metadata()).width).toBe(10);
    }
  });
});
