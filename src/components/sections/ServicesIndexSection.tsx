import { InlineText } from "@/components/ui/inline-text";
import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section, SiteDocument } from "@/lib/validation";

import { headingId, SectionBand, SectionFrame } from "./SectionFrame";
import { ServiceCards } from "./ServiceCards";

type ServicesIndexContent = Extract<Section, { type: "SERVICES_INDEX" }>["content"];

/** Every published service in admin order, without audience categories (D150/D176). */
export function ServicesIndexSection({
  anchor,
  content,
  services,
  image,
  unified = false,
}: {
  anchor: string;
  content: ServicesIndexContent;
  services: readonly PublishedService[];
  site: SiteDocument | null;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
  /** Main Services page: one green compact-card catalogue, without audience groups (D150). */
  unified?: boolean;
}) {
  if (unified)
    return (
      <SectionBand anchor={anchor} tone="leaf" className="grid gap-8">
        <div className="grid max-w-3xl gap-4">
          <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
            <RiseWords text={content.heading.en} />
          </h2>
          {content.intro.en ? (
            <Reveal>
              <p className="text-lead whitespace-pre-line text-ink-2">
                <InlineText text={content.intro.en} />
              </p>
            </Reveal>
          ) : null}
        </div>
        <ServiceCards compact services={services} image={image} />
      </SectionBand>
    );
  return (
    <SectionFrame anchor={anchor} className="grid gap-14">
      <div className="grid max-w-3xl gap-4">
        <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
          <RiseWords text={content.heading.en} />
        </h2>
        {content.intro.en ? (
          <Reveal>
            <p className="text-lead whitespace-pre-line text-ink-2">
              <InlineText text={content.intro.en} />
            </p>
          </Reveal>
        ) : null}
      </div>
      <ServiceCards services={services} image={image} />
    </SectionFrame>
  );
}
