import type { ReactNode } from "react";

import { SettleText } from "@/components/motion/SettleText";
import { MediaImage } from "@/components/ui/media-image";
import { PillLabel } from "@/components/ui/pill-label";
import type { SiteImage } from "@/features/media/types";

/**
 * A page's opening (plan §30.1, D109): Home's hero, smaller. What the page is
 * on a pale pill (left out when the headline already says it), the headline
 * settling into its words with a phrase on the pale-green highlight, the
 * supporting line and the page's own actions; beside them on a wide screen,
 * under them on a phone, a tall rounded photo, fetched first as the page's
 * largest paint. Without a photo, the words stand alone.
 */
export function PageHero({
  anchor,
  label,
  headline,
  highlight = null,
  lede = null,
  image = null,
  children,
}: {
  anchor: string;
  label: string;
  headline: string;
  highlight?: string | null;
  lede?: string | null;
  image?: SiteImage | null;
  /** The page's actions. */
  children?: ReactNode;
}) {
  return (
    <section id={anchor} className="mx-auto w-full max-w-site px-gutter pt-2">
      <div className={image ? "grid gap-8 lg:grid-cols-[1fr_1.04fr] lg:items-center lg:gap-14" : "grid"}>
        <div className="grid content-start justify-items-start gap-6 lg:gap-8">
          {label.toLowerCase() === headline.toLowerCase() ? null : <PillLabel>{label}</PillLabel>}
          <h1 className="max-w-[15ch] text-hero font-normal">
            <SettleText text={headline} highlight={highlight} />
          </h1>
          {lede ? <p className="max-w-[40ch] text-lead whitespace-pre-line text-ink-2">{lede}</p> : null}
          {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-frame bg-mist sm:aspect-[16/10] lg:aspect-auto lg:h-[34rem]">
            <MediaImage
              image={image}
              sizes="(min-width: 78rem) 40rem, (min-width: 64rem) 52vw, 100vw"
              priority
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
