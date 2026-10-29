import type { ReactNode } from "react";

const RATIOS = { landscape: "aspect-[3/2]", portrait: "aspect-[4/5]", square: "aspect-square" } as const;

/**
 * A photograph as a panel of the sign system (plan §30.1, D8): a fixed shape
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
        className={`overflow-hidden rounded-panel bg-mist outline -outline-offset-1 outline-navy/10 ${RATIOS[ratio]} [&_img]:size-full [&_img]:object-cover`}
      >
        {children}
      </div>
      {credit ? <figcaption className="text-small text-ink-2">{credit}</figcaption> : null}
    </figure>
  );
}

/**
 * A client's logo (plan §11): a fixed 4:3 tile, even padding, the logo
 * centred and never stretched or cropped.
 */
export function LogoTile({ children }: { children: ReactNode }) {
  return (
    <div className="grid aspect-[4/3] place-items-center rounded-panel border border-rule bg-ground p-6 [&_img]:max-h-full [&_img]:w-auto [&_img]:object-contain">
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
