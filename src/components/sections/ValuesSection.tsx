import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { Pictogram } from "@/components/ui/pictogram";
import type { Section } from "@/lib/validation";

import { headingId, SectionFrame } from "./SectionFrame";

type ValuesContent = Extract<Section, { type: "VALUES" }>["content"];

/**
 * What the company stands for (plan §6.1, §6.2, D135): the heading rising in
 * word by word beside a ruled list, as Home's About sets its points, each
 * value beside a check, its title in semibold and its line in the quieter
 * ink.
 */
export function ValuesSection({ anchor, content }: { anchor: string; content: ValuesContent }) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
      <h2 id={headingId(anchor)} className="text-display font-medium text-balance">
        <RiseWords text={content.heading.en} />
      </h2>
      <Reveal>
        <ul className="border-t border-rule">
          {content.items.map((item) => (
            <li
              key={item.title.en}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 border-b border-rule py-5 sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-center"
            >
              <Pictogram name="check" size="sm" className="mt-0.5 text-forest sm:mt-0" />
              <h3 className="font-semibold text-navy">{item.title.en}</h3>
              {item.text.en ? <p className="text-ink-2 max-sm:col-start-2">{item.text.en}</p> : null}
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionFrame>
  );
}
