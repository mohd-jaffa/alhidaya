import type { PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { displayPhone, mailtoHref, telHref, whatsappHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { headingId } from "./SectionFrame";

type ContactDetailsContent = Extract<Section, { type: "CONTACT_DETAILS" }>["content"];

/** A labelled channel on the deep-blue ribbon, retaining a full touch target. */
function Detail({
  pictogram,
  term,
  value,
  href,
  order,
}: {
  pictogram: PictogramName;
  term: string;
  value: string;
  href: string;
  order: number;
}) {
  return (
    <Reveal
      order={order}
      className="contact-reach-card grid min-w-0 content-start gap-1 rounded-card bg-card p-5 sm:p-6"
    >
      <dt className="flex items-center gap-3 text-small font-bold text-ink-2">
        <Pictogram name={pictogram} size="sm" className="text-deep" />
        {term}
      </dt>
      <dd className="ms-8">
        <a
          href={href}
          className="inline-flex min-h-touch items-center py-1 text-title font-semibold text-navy tabular-nums underline decoration-transparent underline-offset-4 hover:decoration-current"
        >
          {value}
        </a>
      </dd>
    </Reveal>
  );
}

/** Contact's deep-blue Reach us ribbon (D174); office and map follow beside the form. */
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
    <section
      id={anchor}
      aria-labelledby={headingId(anchor)}
      className="contact-reach scroll-mt-8 bg-deep pt-12 pb-20 text-on-deep sm:pt-14 sm:pb-24"
    >
      <div className="mx-auto grid w-full max-w-site gap-8 px-gutter">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
            <RiseWords text={content.heading.en} />
          </h2>
          {site?.contact.hours.en ? (
            <Reveal className="flex items-center gap-3 text-on-deep-2">
              <Pictogram name="clock" size="sm" />
              <span>{site.contact.hours.en}</span>
            </Reveal>
          ) : null}
        </div>
        {site ? (
          <dl className="grid gap-7 md:grid-cols-3 md:gap-8">
            <Detail
              pictogram="chat"
              term={UI_TEXT.whatsapp}
              value={displayPhone(site.contact.whatsapp)}
              href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)}
              order={0}
            />
            <Detail
              pictogram="phone"
              term={UI_TEXT.phone}
              value={displayPhone(site.contact.phone)}
              href={telHref(site.contact.phone)}
              order={1}
            />
            <Detail
              pictogram="mail"
              term={UI_TEXT.email}
              value={site.contact.email}
              href={mailtoHref(site.contact.email)}
              order={2}
            />
          </dl>
        ) : null}
        {site?.brochure ? (
          <ArrowLink href={ROUTES.brochure} className="contact-reach-brochure">
            {UI_TEXT.downloadBrochure}
          </ArrowLink>
        ) : null}
      </div>
    </section>
  );
}
