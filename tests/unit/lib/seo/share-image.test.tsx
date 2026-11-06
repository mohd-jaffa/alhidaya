// @vitest-environment node
import { describe, expect, it } from "vitest";

import { renderShareImage, SHARE_IMAGE_SIZE } from "@/lib/seo/share-image";

const PNG = [0x89, 0x50, 0x4e, 0x47];

describe("renderShareImage", () => {
  it("draws a self-contained branded PNG with a page label or none, including long published headlines", async () => {
    expect(SHARE_IMAGE_SIZE).toEqual({ width: 1200, height: 630 });
    for (const [title, label] of [
      ["Home nursing care", undefined],
      ["Home nursing care", "For families"],
      [
        "Compassionate nursing care for families, hospitals, clinics and schools across Doha, Qatar".repeat(2),
        "For families",
      ],
    ] as const) {
      const response = await renderShareImage({ title, label });
      expect(response.headers.get("content-type")).toBe("image/png");
      const bytes = new Uint8Array(await response.arrayBuffer());
      expect([...bytes.slice(0, 4)]).toEqual(PNG);
      const view = new DataView(bytes.buffer);
      expect([view.getUint32(16), view.getUint32(20)]).toEqual([1200, 630]);
      expect(bytes.length).toBeLessThan(300_000);
    }
  });
});
