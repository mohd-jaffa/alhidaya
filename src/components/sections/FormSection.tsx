import type { ReactNode } from "react";

import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type FormContent = Extract<Section, { type: "FORM" }>["content"];

/**
 * A form's place on a page (plan §6.7, §6.8, §10): the admin's heading and
 * text above the form itself, which is fixed in code and given by the page.
 */
export function FormSection({ anchor, content, form }: { anchor: string; content: FormContent; form: ReactNode }) {
  return (
    <SectionFrame anchor={anchor}>
      <div className="grid max-w-measure gap-8">
        <div className="grid gap-4">
          <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
          {content.text.en ? <p className="text-lead whitespace-pre-line text-ink-2">{content.text.en}</p> : null}
        </div>
        {form}
      </div>
    </SectionFrame>
  );
}
