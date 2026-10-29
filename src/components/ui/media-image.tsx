import type { ImageSource, SiteImage } from "@/features/media/types";

/** The browser takes the first type it can show: the smallest files first (plan §15). */
const TYPES = ["image/avif", "image/webp", "image/jpeg", "image/png"] as const;

const srcSet = (sources: readonly ImageSource[]) => sources.map(({ url, width }) => `${url} ${width}w`).join(", ");

/**
 * An uploaded image from its made sizes (plan §15, §22.3): nothing is resized
 * when a page is asked for, and no script is sent for it. Each type is offered
 * at every width it was made at, so the browser fetches the smallest file
 * that fills its place; `sizes` says how wide that place is. Its shape is
 * known before it arrives, so nothing shifts. The page's main photo is
 * fetched first; every other one waits until it is near the screen.
 */
export function MediaImage({
  image,
  sizes,
  priority = false,
  className,
}: {
  image: SiteImage;
  /** How wide the image is drawn at each screen width, as the `sizes` attribute. */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const groups = TYPES.map((type) =>
    image.sources.filter((source) => source.mime === type).toSorted((a, b) => a.width - b.width),
  ).filter((group) => group.length > 0);
  const last = groups.at(-1);
  if (!last) return null;

  return (
    <picture>
      {groups.slice(0, -1).map((group) => (
        <source key={group[0].mime} type={group[0].mime} srcSet={srcSet(group)} sizes={sizes} />
      ))}
      {/* Pre-made sizes from the media folder, not Next's resizer (plan §22.3). */}
      <img
        src={last[last.length - 1].url}
        srcSet={srcSet(last)}
        sizes={sizes}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
