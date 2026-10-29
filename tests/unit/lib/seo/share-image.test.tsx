// @vitest-environment node
import { describe, expect, it } from "vitest";

import { renderShareImage, SHARE_IMAGE_SIZE } from "@/lib/seo/share-image";

const PNG = [0x89, 0x50, 0x4e, 0x47];

describe("renderShareImage", () => {
  it("draws a 1200 × 630 PNG of the page's sign, deep blue, sky or leaf green", async () => {
    expect(SHARE_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    for (const tone of ["deep", "sky", "leaf"] as const) {
      const response = await renderShareImage({ title: "Home nursing care", tone });
      expect(response.headers.get("content-type")).toBe("image/png");
      const bytes = new Uint8Array(await response.arrayBuffer());
      expect([...bytes.slice(0, 4)]).toEqual(PNG);
      const view = new DataView(bytes.buffer);
      expect([view.getUint32(16), view.getUint32(20)]).toEqual([1200, 630]);
    }
  });

  it("is deep blue unless told otherwise", async () => {
    const response = await renderShareImage({ title: "Quality nursing care at your doorstep" });
    expect(response.headers.get("content-type")).toBe("image/png");
  });
});
