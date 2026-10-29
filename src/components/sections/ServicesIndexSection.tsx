import { LineRow } from "@/components/ui/line-row";
import { AUDIENCES } from "@/constants/statuses";
import type { PublishedService } from "@/features/services/api";
import type { Section, SiteDocument } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";
import { LineActions, SERVICE_LINES, ServiceStops } from "./ServiceLine";

type ServicesIndexContent = Extract<Section, { type: "SERVICES_INDEX" }>["content"];

/**
 * Every published service, in the admin's order, as stops on its audience's
 * line (plan §6.1, §6.3, §8): care at home with WhatsApp and a call, staffing
 * with a quote. A line with no published services is left out.
 */
export function ServicesIndexSection({
  anchor,
  content,
  services,
  site,
}: {
  anchor: string;
  content: ServicesIndexContent;
  services: readonly PublishedService[];
  site: SiteDocument | null;
}) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-12">
      <div className="grid max-w-measure gap-4">
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
        {content.intro.en ? <p className="text-lead text-ink-2">{content.intro.en}</p> : null}
      </div>
      {AUDIENCES.map((audience) => {
        const onLine = services.filter((service) => service.published.audience === audience);
        if (onLine.length === 0) return null;
        const line = SERVICE_LINES[audience];
        return (
          <div key={audience}>
            <LineRow tone={line.tone} pictogram={line.pictogram} title={line.title} level="h3">
              <LineActions audience={audience} site={site} look="row" />
            </LineRow>
            <ServiceStops tone={line.tone} services={onLine} />
          </div>
        );
      })}
    </SectionFrame>
  );
}
