import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { displayPhone, mailtoHref, telHref, whatsappHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ContactDetailsContent = Extract<Section, { type: "CONTACT_DETAILS" }>["content"];

const LINK = "font-semibold text-deep underline decoration-transparent underline-offset-4 hover:decoration-current";

function Detail({ pictogram, term, children }: { pictogram: PictogramName; term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 gap-y-1 border-t border-rule pt-5">
      <Pictogram name={pictogram} size="md" className="row-span-2 text-navy" />
      <dt className="text-small text-ink-2">{term}</dt>
      <dd className="grid gap-1">{children}</dd>
    </div>
  );
}

/**
 * Every way to reach the company (plan §6.7), from the site content: WhatsApp,
 * the phone, the email, the office with the way to it on Google Maps, the
 * hours, and the brochure when there is one. The static map joins it (R3.5).
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
    <SectionFrame anchor={anchor} className="grid gap-8">
      <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
      {site ? (
        <dl className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          <Detail pictogram="chat" term={UI_TEXT.whatsapp}>
            <a href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)} className={`${LINK} tabular-nums`}>
              {displayPhone(site.contact.whatsapp)}
            </a>
          </Detail>
          <Detail pictogram="phone" term={UI_TEXT.phone}>
            <a href={telHref(site.contact.phone)} className={`${LINK} tabular-nums`}>
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
      ) : null}
    </SectionFrame>
  );
}
