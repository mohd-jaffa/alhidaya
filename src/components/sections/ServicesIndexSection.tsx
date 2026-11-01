import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { AUDIENCE_LABELS, AUDIENCES } from "@/constants/statuses";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section, SiteDocument } from "@/lib/validation";

import { AudienceActions } from "./AudienceActions";
import { headingId, SectionFrame } from "./SectionFrame";
import { ServiceCards } from "./ServiceCards";

type ServicesIndexContent = Extract<Section, { type: "SERVICES_INDEX" }>["content"];

/**
 * Every published service, in the admin's order, by who it is for (plan
 * §6.1, §6.3, §8, D111, D135): the heading rising in word by word, then
 * each audience under its name with its actions (WhatsApp and a call for
 * families, a quote for institutions) and its services as Home's photo
 * cards. An audience with no published services is left out.
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
      <div className="grid max-w-3xl gap-4">
        <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
          <RiseWords text={content.heading.en} />
        </h2>
        {content.intro.en ? (
          <Reveal>
            <p className="text-lead whitespace-pre-line text-ink-2">{content.intro.en}</p>
          </Reveal>
        ) : null}
      </div>
      {AUDIENCES.map((audience) => {
        const theirs = services.filter((service) => service.published.audience === audience);
        if (theirs.length === 0) return null;
        return (
          <div key={audience} className="grid gap-6">
            <Reveal className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-title font-semibold">{AUDIENCE_LABELS[audience]}</h3>
              <div className="flex flex-wrap gap-3">
                <AudienceActions audience={audience} site={site} />
              </div>
            </Reveal>
            <ServiceCards services={theirs} image={image} />
          </div>
        );
      })}
    </SectionFrame>
  );
}
