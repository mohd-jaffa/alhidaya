import type { ReactNode } from "react";

const RATIOS = { landscape: "aspect-[3/2]", portrait: "aspect-[4/5]", square: "aspect-square" } as const;

/**
 * A photograph in its rounded frame (plan §30.1, D8, D97): a fixed shape
 * holding its place before the image arrives, never full-bleed decoration. A
 * stock photograph's credit goes under it, never a caption naming staff.
 */
export function ImageFrame({
  ratio = "landscape",
  credit,
  children,
}: {
  ratio?: keyof typeof RATIOS;
  credit?: string;
  /** The image. */
  children: ReactNode;
}) {
  return (
    <figure className="grid gap-2">
      {/* A hairline drawn over the photo's edge, so a pale photo still reads as a panel on a white page. */}
      <div
        className={`overflow-hidden rounded-frame bg-mist outline -outline-offset-1 outline-navy/10 ${RATIOS[ratio]} [&_img]:size-full [&_img]:object-cover`}
      >
        {children}
      </div>
      {credit ? <figcaption className="text-small text-ink-2">{credit}</figcaption> : null}
    </figure>
  );
}

/**
 * A client's logo (plan §11, D97): a fixed 4:3 mist card, the logo fitted
 * inside its even padding, centred, never stretched or cropped, whatever its
 * shape. The logo is multiplied into the card, so the white a logo file is
 * drawn on takes the card's colour (D118).
 */
export function LogoTile({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-[4/3] rounded-card bg-mist [&_img]:absolute [&_img]:inset-6 [&_img]:size-[calc(100%-3rem)] [&_img]:object-contain [&_img]:mix-blend-multiply">
      {children}
    </div>
  );
}

/** A shape holding the place of what is still loading: a slow fade, still with reduced motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={["animate-wait rounded-tag bg-mist", className].filter(Boolean).join(" ")} />
  );
}
