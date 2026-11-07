import { FOCAL_POINT_LIMITS } from "@/constants/limits";

import type { FocalPoint, ImageRef, SiteImage } from "./types";

/** Add only this content reference's framing; never mutate the shared library image. */
export function placedImage(images: ReadonlyMap<string, SiteImage>, ref: ImageRef | null): SiteImage | null {
  const image = ref ? images.get(ref.mediaId) : undefined;
  if (!image) return null;
  return ref!.focalPoint ? { ...image, focalPoint: ref!.focalPoint } : image;
}

/** Pointer coordinates use the uncropped image; reject hidden/zero-size targets. */
export function focalPointAt(
  x: number,
  y: number,
  rect: { left: number; top: number; width: number; height: number },
): FocalPoint | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const percent = (position: number, start: number, length: number) =>
    Math.max(
      FOCAL_POINT_LIMITS.min,
      Math.min(FOCAL_POINT_LIMITS.max, Math.round(((position - start) / length) * FOCAL_POINT_LIMITS.max)),
    );
  return { x: percent(x, rect.left, rect.width), y: percent(y, rect.top, rect.height) };
}
