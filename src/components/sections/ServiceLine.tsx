import Link from "next/link";
import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { ButtonLink, type ButtonVariant } from "@/components/ui/button";
import { ContactAction } from "@/components/ui/contact-action";
import { Pictogram } from "@/components/ui/pictogram";
import { StationMarker } from "@/components/ui/station-marker";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { Audience } from "@/constants/statuses";
import type { PublishedService } from "@/features/services/api";
import type { SiteDocument } from "@/lib/validation";

/** Which line each audience's services run on (plan §8, D31), named and pictogrammed as on Home (D71). */
export const SERVICE_LINES: Record<Audience, { tone: "sky" | "deep"; pictogram: PictogramName; title: string }> = {
  FAMILIES: { tone: "sky", pictogram: "careAtHome", title: UI_TEXT.lineCareAtHome },
  INSTITUTIONS: { tone: "deep", pictogram: "staffing", title: UI_TEXT.lineStaffing },
};

const ROUTE_LINES = { sky: "bg-sky", deep: "bg-deep" } as const;

/** Where a line's actions sit: on its row in the page, on a sky sign, or on a deep-blue sign. */
const LOOKS: Record<"row" | "skySign" | "deepSign", { main: ButtonVariant; second: ButtonVariant }> = {
  row: { main: "sky", second: "sky" },
  skySign: { main: "primary", second: "secondary" },
  deepSign: { main: "onDeep", second: "onDeepQuiet" },
};

/**
 * A line's working actions (plan D9): WhatsApp and a call for families, a
 * quote for institutions, with the service already chosen when there is one
 * (§6.8). Without published numbers, families' actions wait.
 */
export function LineActions({
  audience,
  site,
  service,
  look,
}: {
  audience: Audience;
  site: SiteDocument | null;
  /** The service the quote is for. */
  service?: string;
  look: keyof typeof LOOKS;
}): ReactNode {
  const { main, second } = LOOKS[look];
  if (audience === "INSTITUTIONS")
    return (
      <ButtonLink href={service ? ROUTES.quoteFor(service) : ROUTES.quote} variant={look === "row" ? "primary" : main}>
        {UI_TEXT.requestQuote}
      </ButtonLink>
    );
  return site ? (
    <>
      <ContactAction kind="whatsapp" to={site.contact.whatsapp} variant={main} />
      <ContactAction kind="call" to={site.contact.phone} variant={second} />
    </>
  ) : null;
}

/**
 * One line's services as stops along it: the line drawn down the side, a
 * station at each stop, the service's name (the whole stop is its link) and
 * its summary.
 */
export function ServiceStops({ tone, services }: { tone: "sky" | "deep"; services: readonly PublishedService[] }) {
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
