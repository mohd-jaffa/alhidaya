import { StatementWords } from "@/components/motion/StatementWords";
import type { Section } from "@/lib/validation";

import { SectionFrame } from "./SectionFrame";

type StatementContent = Extract<Section, { type: "STATEMENT" }>["content"];

/**
 * The statement (plan §30.1, D97): one large centred sentence, its darker
 * phrases what Al Hidaya does and for whom, an icon chip after a phrase that
 * has one, read word by word as it scrolls.
 */
export function StatementSection({ anchor, content }: { anchor: string; content: StatementContent }) {
  return (
    <SectionFrame anchor={anchor} named={false} className="py-6 lg:py-10">
      <StatementWords
        parts={content.parts.map((part) => ({ text: part.text.en, strong: part.strong, pictogram: part.pictogram }))}
        className="mx-auto max-w-[30ch] text-center text-statement font-normal text-balance"
      />
    </SectionFrame>
  );
}
