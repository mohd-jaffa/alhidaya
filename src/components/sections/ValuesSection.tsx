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
export function ValuesSection({
  anchor,
  content,
  panels = false,
}: {
  anchor: string;
  content: ValuesContent;
  panels?: boolean;
}) {
  if (panels)
    return (
      <SectionFrame anchor={anchor} className="grid gap-8 sm:gap-10">
        <h2 id={headingId(anchor)} className="text-display font-semibold text-balance">
          <RiseWords text={content.heading.en} />
        </h2>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {content.items.map((item, index) => (
            <Reveal key={item.title.en} order={index % 3} className="min-w-0">
              <article
                aria-labelledby={`${anchor}-value-${index}`}
                className={`promise-card relative h-full overflow-hidden rounded-card p-7 sm:p-8 ${index % 3 === 0 ? "bg-deep text-on-deep" : index % 3 === 1 ? "bg-leaf-pale text-navy" : "bg-mist text-navy"}`}
              >
                <h3
                  id={`${anchor}-value-${index}`}
                  className="relative z-10 text-value-title font-semibold wrap-anywhere"
                >
                  {item.title.en}
                </h3>
                {item.text.en ? (
                  <p
                    className={`relative z-10 mt-5 text-lead wrap-anywhere ${index % 3 === 0 ? "text-on-deep-2" : "text-ink-2"}`}
                  >
                    {item.text.en}
                  </p>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>
      </SectionFrame>
    );
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
