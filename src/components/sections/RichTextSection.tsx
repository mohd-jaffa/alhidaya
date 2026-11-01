import { Reveal } from "@/components/motion/Reveal";
import { RichText } from "@/components/ui/rich-text";
import type { RichText as RichTextBlocks, Section } from "@/lib/validation";

import { SectionBand, SectionFrame, SectionHeading } from "./SectionFrame";

type RichTextContent = Extract<Section, { type: "RICH_TEXT" }>["content"];

/** The text in parts, each heading with the words under it; what comes before the first heading is a part of its own. */
export function textParts(blocks: RichTextBlocks): RichTextBlocks[] {
  const parts: RichTextBlocks[] = [];
  for (const block of blocks) {
    if (block.type === "heading" || parts.length === 0) parts.push([block]);
    else parts[parts.length - 1].push(block);
  }
  return parts;
}

/**
 * The admin's own text (plan §6.2, §6.9): with a heading, its headings sit
 * under it; without one, they are the page's. Each part, a heading with its
 * words, rises into place as it scrolls into view (D125). On Careers it lies
 * on Home's pastel-blue band (D135).
 */
export function RichTextSection({
  anchor,
  content,
  band = false,
}: {
  anchor: string;
  content: RichTextContent;
  /** On the pastel-blue band, as Careers sets it. */
  band?: boolean;
}) {
  const heading = content.heading.en;
  const Frame = band ? SectionBand : SectionFrame;
  return (
    <Frame anchor={anchor} named={heading !== null} tone="mist" className="grid gap-6">
      {heading ? (
        <Reveal>
          <SectionHeading anchor={anchor}>{heading}</SectionHeading>
        </Reveal>
      ) : null}
      <div className="grid gap-5">
        {textParts(content.body).map((part, at) => (
          // Parts have no ids of their own; their place in the text is theirs.
          <Reveal key={at}>
            <RichText blocks={part} headingLevel={heading ? "h3" : "h2"} />
          </Reveal>
        ))}
      </div>
    </Frame>
  );
}
