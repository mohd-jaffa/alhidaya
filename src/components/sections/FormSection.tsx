import type { ReactNode } from "react";

import type { PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { IconChip } from "@/components/ui/icon-chip";
import { UI_TEXT } from "@/constants/messages";
import type { SectionForm } from "@/constants/statuses";
import { displayPhone, mailtoHref, telHref, whatsappHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { headingId, SectionFrame } from "./SectionFrame";

type FormContent = Extract<Section, { type: "FORM" }>["content"];

/** One way to reach the company beside the short quote: its mark, what it is, and the number or address. */
function Way({
  pictogram,
  label,
  value,
  href,
}: {
  pictogram: PictogramName;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li>
      <a href={href} className="group flex items-center gap-4">
        <IconChip name={pictogram} tone={pictogram === "chat" ? "leaf" : "blue"} size="md" />
        <span className="grid">
          <span className="text-small text-ink-2">{label}</span>
          <span className="text-title font-semibold text-navy tabular-nums underline decoration-transparent underline-offset-4 group-hover:decoration-current">
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}

/**
 * Home's short quote (D130, from Theme 4): on a pale-green band edge to edge,
 * the admin's heading and words with the ways to reach the company from
 * Settings; beside them the form on a raised card under a deep-blue strip.
 */
function QuoteBand({
  anchor,
  content,
  form,
  site,
}: {
  anchor: string;
  content: FormContent;
  form: ReactNode;
  site: SiteDocument | null;
}) {
  return (
    <section id={anchor} aria-labelledby={headingId(anchor)} className="scroll-mt-8 bg-leaf-pale py-section">
      <div className="mx-auto grid max-w-site gap-12 px-gutter lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        <div className="grid content-start gap-5">
          <h2 id={headingId(anchor)} className="text-display font-semibold">
            <RiseWords text={content.heading.en} />
          </h2>
          {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
          {site ? (
            <Reveal>
              <ul className="mt-4 grid gap-5">
                <Way
                  pictogram="chat"
                  label={UI_TEXT.whatsappUs}
                  value={displayPhone(site.contact.whatsapp)}
                  href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)}
                />
                <Way
                  pictogram="phone"
                  label={UI_TEXT.callUs247}
                  value={displayPhone(site.contact.phone)}
                  href={telHref(site.contact.phone)}
                />
                <Way
                  pictogram="mail"
                  label={UI_TEXT.emailUs}
                  value={site.contact.email}
                  href={mailtoHref(site.contact.email)}
                />
              </ul>
            </Reveal>
          ) : null}
        </div>
        <Reveal order={1} className="overflow-hidden rounded-card bg-card shadow-overlay">
          <p className="flex items-center justify-between gap-4 bg-deep px-6 py-5 text-on-deep sm:px-8">
            <span className="text-title font-semibold">{UI_TEXT.quoteCardTitle}</span>
            <span className="text-small text-on-deep-2">{UI_TEXT.quoteCardNote}</span>
          </p>
          <div className="p-6 sm:p-8">{form}</div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * A form's place on a page (plan §6.7, §6.8, §10): Home's short quote on its
 * band (D130); any other form beside the email as a chip, the admin's heading
 * and their words, staying in view beside a long form on a wide screen, the
 * form itself, fixed in code and given by the page, on a raised card. Each
 * rises into place as it scrolls into view (D125).
 */
export function FormSection({
  anchor,
  content,
  form,
  kind,
  site,
}: {
  anchor: string;
  content: FormContent;
  form: ReactNode;
  /** Which form the section holds. */
  kind: SectionForm;
  site: SiteDocument | null;
}) {
  if (kind === "SHORT_QUOTE") return <QuoteBand anchor={anchor} content={content} form={form} site={site} />;
  const email = site?.contact.email ?? null;
  return (
    <SectionFrame anchor={anchor}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal className="grid content-start gap-6 lg:sticky lg:top-8 lg:self-start">
          {email ? (
            <a
              href={mailtoHref(email)}
              className="inline-flex items-center gap-2.5 justify-self-start rounded-pill py-1 pe-2 text-small font-medium hover:text-deep"
            >
              <IconChip name="mail" size="md" />
              {email}
            </a>
          ) : null}
          <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
            <RiseWords text={content.heading.en} />
          </h2>
          {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
        </Reveal>
        <Reveal order={1} className="rounded-card bg-card p-5 shadow-raised sm:p-8 lg:p-10">
          {form}
        </Reveal>
      </div>
    </SectionFrame>
  );
}
