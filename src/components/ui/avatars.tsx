import type { SiteImage } from "@/features/media/types";

import { MediaImage } from "./media-image";

const SIZES = {
  sm: { box: "size-10", sizes: "40px" },
  md: { box: "size-12 sm:size-14", sizes: "56px" },
  lg: { box: "size-14 sm:size-16", sizes: "64px" },
} as const;

/**
 * Faces in a group (D97): round photos overlapping one another, each ringed
 * in the ground's white. They say nothing a screen reader needs: the words
 * beside them carry the meaning.
 */
export function Avatars({ images, size = "md" }: { images: readonly SiteImage[]; size?: keyof typeof SIZES }) {
  if (images.length === 0) return null;
  return (
    <ul className="flex items-center -space-x-3 rtl:space-x-reverse">
      {images.map((image) => (
        <li key={image.id} className={`${SIZES[size].box} overflow-hidden rounded-full ring-3 ring-ground`}>
          <MediaImage image={image} sizes={SIZES[size].sizes} decorative className="size-full object-cover" />
        </li>
      ))}
    </ul>
  );
}
