import { RichText } from "@/components/ui/rich-text";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type RichTextContent = Extract<Section, { type: "RICH_TEXT" }>["content"];

/** The admin's own text (plan §6.2, §6.9): with a heading, its headings sit under it; without one, they are the page's. */
export function RichTextSection({ anchor, content }: { anchor: string; content: RichTextContent }) {
  const heading = content.heading.en;
  return (
    <SectionFrame anchor={anchor} named={heading !== null} className="grid gap-6">
      {heading ? <SectionHeading anchor={anchor}>{heading}</SectionHeading> : null}
      <RichText blocks={content.body} headingLevel={heading ? "h3" : "h2"} />
    </SectionFrame>
  );
}
