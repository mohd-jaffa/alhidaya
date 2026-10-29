import { ContactAction } from "@/components/ui/contact-action";
import { displayPhone, mailtoHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ContactBandContent = Extract<Section, { type: "CONTACT_BAND" }>["content"];

/**
 * The way to reach the company at the end of a page (plan §6.1, D9): a
 * deep-blue sign with the admin's words, WhatsApp and a call as its actions,
 * the number and the email written out, and the hours.
 */
export function ContactBandSection({
  anchor,
  content,
  site,
}: {
  anchor: string;
  content: ContactBandContent;
  site: SiteDocument | null;
}) {
  return (
    <SectionFrame anchor={anchor}>
      <div className="grid gap-8 rounded-panel bg-deep p-sign text-on-deep lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
        <div className="grid content-start gap-4">
          <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
          {content.text.en ? (
            <p className="max-w-[46ch] text-lead whitespace-pre-line text-on-deep-2">{content.text.en}</p>
          ) : null}
        </div>
        {site ? (
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-3">
              <ContactAction kind="whatsapp" to={site.contact.whatsapp} variant="onDeep" size="lg" />
              <ContactAction kind="call" to={site.contact.phone} variant="onDeepQuiet" size="lg" />
            </div>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-on-deep-2">
              <span className="tabular-nums">{displayPhone(site.contact.phone)}</span>
              <a
                href={mailtoHref(site.contact.email)}
                className="underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline-focus-on-deep"
              >
                {site.contact.email}
              </a>
              {site.contact.hours.en ? <span>{site.contact.hours.en}</span> : null}
            </p>
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );
}
