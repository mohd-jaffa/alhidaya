import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { IconChip } from "@/components/ui/icon-chip";
import { UI_TEXT } from "@/constants/messages";
import type { SectionForm } from "@/constants/statuses";
import { mailtoHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { ContactWays } from "./ContactWays";
import { headingId, SectionBand, SectionFrame } from "./SectionFrame";

type FormContent = Extract<Section, { type: "FORM" }>["content"];

/** What a form's card says on its deep-blue strip (D130, D135). */
const CARD_TITLES: Record<SectionForm, string> = {
  SHORT_QUOTE: UI_TEXT.quoteCardTitle,
  QUOTE: UI_TEXT.quoteCardTitle,
  CONTACT: UI_TEXT.messageCardTitle,
};

/** A form on Home's raised card (D130): under a deep-blue strip naming it, with the note that a reply comes quickly. */
function FormCard({ kind, form }: { kind: SectionForm; form: ReactNode }) {
  return (
    <Reveal order={1} className="overflow-hidden rounded-card bg-card shadow-overlay">
      <p className="flex items-center justify-between gap-4 bg-deep px-6 py-5 text-on-deep sm:px-8">
        <span className="text-title font-semibold">{CARD_TITLES[kind]}</span>
        <span className="text-small text-on-deep-2">{UI_TEXT.quoteCardNote}</span>
      </p>
      <div className="p-6 sm:p-8">{form}</div>
    </Reveal>
  );
}

/**
 * Home's short quote (D130, from Theme 4): on a pale-green band edge to edge,
 * the admin's heading and words with the ways to reach the company from
 * Settings; beside them the form on its card.
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
    <SectionBand
      anchor={anchor}
      tone="leaf"
      className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16"
    >
      <div className="grid content-start gap-5">
        <h2 id={headingId(anchor)} className="text-display font-semibold">
          <RiseWords text={content.heading.en} />
        </h2>
        {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
        {site ? (
          <Reveal>
            <ContactWays site={site} className="mt-4" />
          </Reveal>
        ) : null}
      </div>
      <FormCard kind="SHORT_QUOTE" form={form} />
    </SectionBand>
  );
}

/**
 * A form's place on a page (plan §6.7, §6.8, §10): Home's short quote on its
 * band (D130); any other form beside the email as a chip, the admin's heading
 * and their words, staying in view beside a long form on a wide screen, the
 * form itself, fixed in code and given by the page, on a raised card. On the
 * Contact page (D135) it sits on Home's pale-green band, on Home's card. Each
 * rises into place as it scrolls into view (D125).
 */
export function FormSection({
  anchor,
  content,
  form,
  kind,
  site,
  band = false,
}: {
  anchor: string;
  content: FormContent;
  form: ReactNode;
  /** Which form the section holds. */
  kind: SectionForm;
  site: SiteDocument | null;
  /** On the pale-green band and Home's card, as the Contact page sets it. */
  band?: boolean;
}) {
  if (kind === "SHORT_QUOTE") return <QuoteBand anchor={anchor} content={content} form={form} site={site} />;
  const email = site?.contact.email ?? null;
  const layout = "grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14";
  const opening = (
    <Reveal className="grid content-start gap-6 lg:sticky lg:top-8 lg:self-start">
      {email ? (
        <a
          href={mailtoHref(email)}
          className="inline-flex items-center gap-2.5 justify-self-start rounded-pill py-1 pe-2 text-small font-medium hover:text-deep"
        >
          <IconChip name="mail" size="md" tone={band ? "blue" : "pale"} />
          {email}
        </a>
      ) : null}
      <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
        <RiseWords text={content.heading.en} />
      </h2>
      {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
    </Reveal>
  );
  return band ? (
    <SectionBand anchor={anchor} tone="leaf" className={layout}>
      {opening}
      <FormCard kind={kind} form={form} />
    </SectionBand>
  ) : (
    <SectionFrame anchor={anchor}>
      <div className={layout}>
        {opening}
        <Reveal order={1} className="rounded-card bg-card p-5 shadow-raised sm:p-8 lg:p-10">
          {form}
        </Reveal>
      </div>
    </SectionFrame>
  );
}
