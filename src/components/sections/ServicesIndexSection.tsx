import Link from "next/link";
import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { ButtonLink } from "@/components/ui/button";
import { ContactAction } from "@/components/ui/contact-action";
import { LineRow } from "@/components/ui/line-row";
import { Pictogram } from "@/components/ui/pictogram";
import { StationMarker } from "@/components/ui/station-marker";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { Audience } from "@/constants/statuses";
import type { PublishedService } from "@/features/services/api";
import type { Section, SiteDocument } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ServicesIndexContent = Extract<Section, { type: "SERVICES_INDEX" }>["content"];

const ROUTE_LINES = { sky: "bg-sky", deep: "bg-deep" } as const;

/** Which line each audience's services run on (plan §8, D31), named and pictogrammed as on Home (D71). */
const LINES: Record<Audience, { tone: "sky" | "deep"; pictogram: PictogramName; title: string }> = {
  FAMILIES: { tone: "sky", pictogram: "careAtHome", title: UI_TEXT.lineCareAtHome },
  INSTITUTIONS: { tone: "deep", pictogram: "staffing", title: UI_TEXT.lineStaffing },
};

/**
 * One line's services as stops along it: the line drawn down the side, a
 * station at each stop, the service's name (the whole stop is its link) and
 * its summary.
 */
function Stops({ tone, services }: { tone: "sky" | "deep"; services: readonly PublishedService[] }) {
  return (
    <ol className="relative">
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 start-(--line-rail-centre) w-(--line-width) ${ROUTE_LINES[tone]}`}
      />
      {services.map((service) => (
        <li key={service.id} className="group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
          <span className="relative pt-6">
            <StationMarker tone={tone} state="passed" />
          </span>
          <div className="grid gap-x-8 gap-y-1 border-b border-rule py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] md:items-baseline">
            <Link
              href={ROUTES.service(service.published.slug)}
              className="text-title font-bold underline decoration-transparent underline-offset-4 group-hover:decoration-current after:absolute after:inset-0"
            >
              {service.published.name.en}
            </Link>
            <p className="text-ink-2">{service.published.summary.en}</p>
            <Pictogram
              name="arrow"
              size="sm"
              className="hidden text-deep transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1 md:block rtl:group-hover:-translate-x-1"
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

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
  const actions: Record<Audience, ReactNode> = {
    FAMILIES: site ? (
      <>
        <ContactAction kind="whatsapp" to={site.contact.whatsapp} variant="sky" />
        <ContactAction kind="call" to={site.contact.phone} variant="sky" />
      </>
    ) : null,
    INSTITUTIONS: <ButtonLink href={ROUTES.quote}>{UI_TEXT.requestQuote}</ButtonLink>,
  };
  return (
    <SectionFrame anchor={anchor} className="grid gap-12">
      <div className="grid max-w-measure gap-4">
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
        {content.intro.en ? <p className="text-lead text-ink-2">{content.intro.en}</p> : null}
      </div>
      {(Object.keys(LINES) as Audience[]).map((audience) => {
        const onLine = services.filter((service) => service.published.audience === audience);
        if (onLine.length === 0) return null;
        const line = LINES[audience];
        return (
          <div key={audience}>
            <LineRow tone={line.tone} pictogram={line.pictogram} title={line.title} level="h3">
              {actions[audience]}
            </LineRow>
            <Stops tone={line.tone} services={onLine} />
          </div>
        );
      })}
    </SectionFrame>
  );
}
