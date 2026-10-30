import { Reveal } from "@/components/motion/Reveal";
import { PillLabel } from "@/components/ui/pill-label";
import { AUDIENCE_LABELS, AUDIENCES } from "@/constants/statuses";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section, SiteDocument } from "@/lib/validation";

import { AudienceActions } from "./AudienceActions";
import { SectionFrame, SectionHeading } from "./SectionFrame";
import { ServiceCards } from "./ServiceCards";

type ServicesIndexContent = Extract<Section, { type: "SERVICES_INDEX" }>["content"];

/**
 * Every published service, in the admin's order, by who it is for (plan
 * §6.1, §6.3, §8, D111): each audience under its pill with its actions
 * (WhatsApp and a call for families, a quote for institutions), then its
 * services as photo cards. An audience with no published services is left
 * out.
 */
export function ServicesIndexSection({
  anchor,
  content,
  services,
  site,
  image,
}: {
  anchor: string;
  content: ServicesIndexContent;
  services: readonly PublishedService[];
  site: SiteDocument | null;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-14">
      <Reveal className="grid max-w-3xl gap-4">
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
        {content.intro.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.intro.en}</p> : null}
      </Reveal>
      {AUDIENCES.map((audience) => {
        const theirs = services.filter((service) => service.published.audience === audience);
        if (theirs.length === 0) return null;
        return (
          <div key={audience} className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <PillLabel as="h3">{AUDIENCE_LABELS[audience]}</PillLabel>
              <div className="flex flex-wrap gap-3">
                <AudienceActions audience={audience} site={site} />
              </div>
            </div>
            <ServiceCards services={theirs} image={image} />
          </div>
        );
      })}
    </SectionFrame>
  );
}
