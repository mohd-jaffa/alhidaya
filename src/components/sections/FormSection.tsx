import { InlineText } from "@/components/ui/inline-text";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { IconChip } from "@/components/ui/icon-chip";
import type { SectionForm } from "@/constants/statuses";
import { mailtoHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

import { ContactWays } from "./ContactWays";
import { ContactMessageSection } from "./ContactMessageSection";
import { headingId, SectionBand, SectionFrame } from "./SectionFrame";

type FormContent = Extract<Section, { type: "FORM" }>["content"];

/** Home's reference form: one plain white card, with no title strip (D151). */
function FormCard({ form }: { form: ReactNode }) {
  return (
    <Reveal order={1} className="form-card rounded-card bg-card p-6 shadow-float sm:p-8">
      {form}
    </Reveal>
  );
}

/**
 * Home's short quote (D151): the supplied rounded-panel reference on pastel blue,
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
    <div className="home-quote mx-4 mb-4 overflow-hidden rounded-card">
      <SectionBand
        anchor={anchor}
        tone="mist"
        className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14"
      >
        <div className="grid content-start gap-5">
          <h2 id={headingId(anchor)} className="text-display font-semibold">
            <RiseWords text={content.heading.en} />
          </h2>
          {content.text.en ? (
            <p className="text-lead whitespace-pre-line text-ink-2">
              <InlineText text={content.text.en} />
            </p>
          ) : null}
          {site ? (
            <Reveal>
              <ContactWays site={site} className="mt-4" tiles />
            </Reveal>
          ) : null}
        </div>
        <FormCard form={form} />
      </SectionBand>
    </div>
  );
}

/**
 * A form's place on a page (plan §6.7, §6.8, §10): Home's short quote on its
 * band (D130); any other form beside the email as a chip, the admin's heading
 * and their words, staying in view beside a long form on a wide screen, the
 * form itself, fixed in code and given by the page, on a raised card. On the
 * Contact page (D145) its message panel overlaps the ribbon beside the office. Each
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
  /** Use Contact’s approved message/office band. */
  band?: boolean;
}) {
  if (kind === "SHORT_QUOTE") return <QuoteBand anchor={anchor} content={content} form={form} site={site} />;
  if (band) return <ContactMessageSection anchor={anchor} content={content} form={form} site={site} />;
  const email = site?.contact.email ?? null;
  const layout = "grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14";
  const opening = (
    <Reveal className="grid content-start gap-6 lg:sticky lg:top-8 lg:self-start">
      {email ? (
        <a
          href={mailtoHref(email)}
          className="inline-flex items-center gap-2.5 justify-self-start rounded-pill py-1 pe-2 text-small font-medium hover:text-deep"
        >
          <IconChip name="mail" size="md" tone="pale" />
          {email}
        </a>
      ) : null}
      <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
        <RiseWords text={content.heading.en} />
      </h2>
      {content.text.en ? (
        <p className="text-lead whitespace-pre-line text-ink-2">
          <InlineText text={content.text.en} />
        </p>
      ) : null}
    </Reveal>
  );
  return (
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
