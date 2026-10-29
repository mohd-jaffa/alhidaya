import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type ValuesContent = Extract<Section, { type: "VALUES" }>["content"];

/**
 * What the company stands for (plan §6.1, §6.2): each value a stop on a
 * hairline, its title and its line; as many across as fit.
 */
export function ValuesSection({ anchor, content }: { anchor: string; content: ValuesContent }) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-10">
      <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
      <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
        {content.items.map((item) => (
          <li key={item.title.en} className="relative grid content-start gap-2 border-t border-rule pt-6">
            <span aria-hidden="true" className="absolute start-0 top-0 size-3 -translate-y-1/2 rounded-full bg-deep" />
            <h3 className="text-title font-bold">{item.title.en}</h3>
            {item.text.en ? <p className="text-ink-2">{item.text.en}</p> : null}
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}
