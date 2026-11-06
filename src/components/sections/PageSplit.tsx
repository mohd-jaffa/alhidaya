import type { ReactNode } from "react";

import { Words } from "@/components/motion/Words";
import { MediaImage } from "@/components/ui/media-image";
import type { SiteImage } from "@/features/media/types";

/** The words' start, in line with the site's width on a wide screen while the photo runs to the window's edge. */
const ALIGN = "lg:ps-[max(var(--spacing-gutter),calc((100vw-var(--container-site))/2+var(--spacing-gutter)))] lg:pe-14";

/**
 * An inner page's opening (D135): Home's slides in straight lines, still.
 * Under a rule, the page's name in deep blue (left out when the headline
 * already says it), the headline with its phrase in deep blue, its words
 * rising from behind their line, the supporting line and the page's actions;
 * beside them the photo edge to edge, the page's first paint, above them on
 * a phone. Without a photo, the words stand alone at the site's width.
 */
export function PageSplit({
  anchor,
  label,
  headline,
  highlight = null,
  lede = null,
  image = null,
  blend = false,
  className = "",
  children,
}: {
  anchor: string;
  label: string;
  headline: string;
  highlight?: string | null;
  lede?: string | null;
  image?: SiteImage | null;
  /** Approved photo/white-header blend on About and main Services only (D158). */
  blend?: boolean;
  className?: string;
  /** The page's actions. */
  children?: ReactNode;
}) {
  const words = (
    <div
      className={`page-split grid content-center justify-items-start gap-6 ${image ? `px-gutter py-12 sm:py-16 ${ALIGN}` : "pt-12 sm:pt-16"}`}
    >
      {headline.toLowerCase().includes(label.toLowerCase()) ? null : <p className="font-semibold text-deep">{label}</p>}
      <h1 className="max-w-split text-hero font-semibold text-navy">
        <Words text={headline} highlight={highlight} />
      </h1>
      {lede ? <p className="split-line max-w-page-lede text-lead whitespace-pre-line text-ink-2">{lede}</p> : null}
      {children ? <div className="split-line flex flex-wrap gap-3">{children}</div> : null}
    </div>
  );
  return image ? (
    <section
      id={anchor}
      className={`${className} ${blend ? "opening-blend opening-blend--page" : ""} grid border-t border-rule lg:min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]`}
    >
      {words}
      <div className="relative min-h-[18rem] overflow-hidden max-lg:order-first sm:min-h-[26rem] lg:min-h-full">
        <MediaImage
          image={image}
          sizes={blend ? "100vw" : "(min-width: 64rem) 52vw, 100vw"}
          priority
          className="split-photo absolute inset-0 size-full object-cover"
        />
      </div>
    </section>
  ) : (
    <section id={anchor} className={`${className} page-split--plain border-t border-rule`}>
      <div className="mx-auto w-full max-w-site px-gutter">{words}</div>
    </section>
  );
}
