import type { ReactNode } from "react";

import { IconChip } from "@/components/ui/icon-chip";
import { mailtoHref } from "@/lib/contact";
import type { Section } from "@/lib/validation";

import { headingId, SectionFrame } from "./SectionFrame";

type FormContent = Extract<Section, { type: "FORM" }>["content"];

/**
 * A form's place on a page (plan §6.7, §6.8, §10), as the reference sets it
 * (D97, D104): beside the form, the email as a chip, the admin's heading,
 * large and light, and their words, staying in view beside a long form on a
 * wide screen; the form itself, fixed in code and given by the page, on a
 * mist panel.
 */
export function FormSection({
  anchor,
  content,
  form,
  email,
}: {
  anchor: string;
  content: FormContent;
  form: ReactNode;
  /** The site's email, from Settings. */
  email: string | null;
}) {
  return (
    <SectionFrame anchor={anchor}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="grid content-start gap-6 lg:sticky lg:top-8 lg:self-start">
          {email ? (
            <a
              href={mailtoHref(email)}
              className="inline-flex items-center gap-2.5 justify-self-start rounded-pill py-1 pe-2 text-small font-medium hover:text-forest"
            >
              <IconChip name="mail" size="md" />
              {email}
            </a>
          ) : null}
          <h2 id={headingId(anchor)} className="text-display font-normal text-balance">
            {content.heading.en}
          </h2>
          {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
        </div>
        <div className="rounded-card bg-mist p-5 sm:p-8 lg:p-10">{form}</div>
      </div>
    </SectionFrame>
  );
}
