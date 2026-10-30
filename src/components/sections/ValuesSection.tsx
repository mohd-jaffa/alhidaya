import { Reveal } from "@/components/motion/Reveal";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ValuesContent = Extract<Section, { type: "VALUES" }>["content"];

/**
 * What the company stands for (plan §6.1, §6.2, D97): each value a mist card,
 * its title and its line, as many across as fit; they rise in one after
 * another.
 */
export function ValuesSection({ anchor, content }: { anchor: string; content: ValuesContent }) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-10">
      <Reveal>
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
      </Reveal>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
        {content.items.map((item, at) => (
          <li key={item.title.en}>
            <Reveal order={at} className="grid h-full content-start gap-2 rounded-card bg-mist p-6 sm:p-8">
              <h3 className="text-title font-medium">{item.title.en}</h3>
              {item.text.en ? <p className="text-ink-2">{item.text.en}</p> : null}
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}
