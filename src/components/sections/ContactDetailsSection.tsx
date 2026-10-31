import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { IconChip } from "@/components/ui/icon-chip";
import { StaticMap } from "@/components/ui/static-map";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { displayPhone, mailtoHref, telHref, whatsappHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ContactDetailsContent = Extract<Section, { type: "CONTACT_DETAILS" }>["content"];

const LINK = "font-medium text-forest underline decoration-transparent underline-offset-4 hover:decoration-current";

/** One way to reach the company on its mist card (D97): its icon in a white chip, what it is, and it. */
function Detail({ pictogram, term, children }: { pictogram: PictogramName; term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 gap-y-1 rounded-card bg-mist p-5 sm:p-6">
      <IconChip name={pictogram} tone="ground" className="row-span-2" />
      <dt className="text-small text-ink-2">{term}</dt>
      <dd className="grid justify-items-start gap-1">{children}</dd>
    </div>
  );
}

/**
 * Every way to reach the company (plan §6.7), from the site content, each on
 * its own card: WhatsApp, the phone, the email, the office with the way to it
 * on Google Maps, the hours, and the brochure when there is one; beside them,
 * the static map.
 */
export function ContactDetailsSection({
  anchor,
  content,
  site,
}: {
  anchor: string;
  content: ContactDetailsContent;
  site: SiteDocument | null;
}) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-10">
      <Reveal>
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
      </Reveal>
      {site ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
          <Reveal>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail pictogram="chat" term={UI_TEXT.whatsapp}>
                <a
                  href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)}
                  className={`${LINK} whitespace-nowrap tabular-nums`}
                >
                  {displayPhone(site.contact.whatsapp)}
                </a>
              </Detail>
              <Detail pictogram="phone" term={UI_TEXT.phone}>
                <a href={telHref(site.contact.phone)} className={`${LINK} whitespace-nowrap tabular-nums`}>
                  {displayPhone(site.contact.phone)}
                </a>
              </Detail>
              <Detail pictogram="mail" term={UI_TEXT.email}>
                <a href={mailtoHref(site.contact.email)} className={LINK}>
                  {site.contact.email}
                </a>
              </Detail>
              <Detail pictogram="location" term={UI_TEXT.address}>
                <address className="grid not-italic">
                  {site.contact.address.map((line) => (
                    <span key={line.en}>{line.en}</span>
                  ))}
                </address>
                <ArrowLink href={site.contact.mapUrl}>{UI_TEXT.openInMaps}</ArrowLink>
              </Detail>
              {site.contact.hours.en ? (
                <Detail pictogram="clock" term={UI_TEXT.hours}>
                  <span>{site.contact.hours.en}</span>
                </Detail>
              ) : null}
              {site.brochure ? (
                <Detail pictogram="download" term={UI_TEXT.brochure}>
                  <ArrowLink href={ROUTES.brochure}>{UI_TEXT.downloadBrochure}</ArrowLink>
                </Detail>
              ) : null}
            </dl>
          </Reveal>
          <Reveal order={1}>
            <StaticMap pin={site.contact.mapPin} office={site.contact.address[0].en} />
          </Reveal>
        </div>
      ) : null}
    </SectionFrame>
  );
}
