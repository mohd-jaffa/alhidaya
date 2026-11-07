import { describe, expect, it } from "vitest";

import { focalPointAt, placedImage } from "@/features/media/framing";
import type { SiteImage } from "@/features/media/types";

const image: SiteImage = { id: "photo", width: 1600, height: 900, alt: "Care", sources: [] };

describe("placement framing", () => {
  it("preserves old references and handles absent images", () => {
    const images = new Map([[image.id, image]]);
    expect(placedImage(images, null)).toBeNull();
    expect(placedImage(images, { mediaId: "missing" })).toBeNull();
    expect(placedImage(images, { mediaId: image.id })).toBe(image);
  });

  it("keeps independent references to the same file independent", () => {
    const images = new Map([[image.id, image]]);
    const first = placedImage(images, { mediaId: image.id, focalPoint: { x: 10, y: 90 } });
    const second = placedImage(images, { mediaId: image.id, focalPoint: { x: 80, y: 20 } });
    expect(first?.focalPoint).toEqual({ x: 10, y: 90 });
    expect(second?.focalPoint).toEqual({ x: 80, y: 20 });
    expect(image.focalPoint).toBeUndefined();
    expect(first?.sources).toBe(image.sources);
  });

  it("maps physical pointer coordinates and clamps all edges", () => {
    const rect = { left: 10, top: 20, width: 200, height: 100 };
    expect(focalPointAt(60, 95, rect)).toEqual({ x: 25, y: 75 });
    expect(focalPointAt(-50, 500, rect)).toEqual({ x: 0, y: 100 });
    expect(focalPointAt(500, -50, rect)).toEqual({ x: 100, y: 0 });
    expect(focalPointAt(60, 95, { ...rect, width: 0 })).toBeNull();
    expect(focalPointAt(60, 95, { ...rect, height: 0 })).toBeNull();
  });
});
