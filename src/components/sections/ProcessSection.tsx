import { Reveal } from "@/components/motion/Reveal";
import { ScrollTrack } from "@/components/motion/ScrollTrack";
import { MediaImage } from "@/components/ui/media-image";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { ordinal } from "./numbered";
import { SectionFrame, SectionOpening } from "./SectionFrame";

type ProcessContent = Extract<Section, { type: "PROCESS" }>["content"];

/** A step's number as the reference sets it: two figures. */
/**
 * How it works (plan §30.1, D97): its pill and heading, then the steps in
 * order, each numbered (the order is the point), with a round photo, its title
 * and words; on a wide screen the row runs to the window's edges and the
 * section holds while the steps travel sideways past it with the scroll.
 */
export function ProcessSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: ProcessContent;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  return (
    <SectionFrame anchor={anchor} className="grid gap-12 py-section">
      <Reveal>
        <SectionOpening
          anchor={anchor}
          label={content.label.en}
          start={content.headingStart.en}
          pictogram={content.pictogram}
          end={content.headingEnd.en}
        />
      </Reveal>
      <ScrollTrack
        held
        label={content.label.en}
        as="ol"
        className="-mx-gutter px-gutter lg:mx-[calc(50%_-_50vw)] lg:px-[max(var(--spacing-gutter),calc((100vw_-_var(--container-site))/2_+_var(--spacing-gutter)))]"
        trackClassName="gap-4"
      >
        {content.steps.map((step, at) => {
          const photo = image(step.image);
          return (
            <li
              key={step.title.en}
              className="grid w-[17.5rem] shrink-0 content-start justify-items-center gap-5 rounded-card bg-mist p-6 pb-8 text-center sm:w-[20rem]"
            >
              <span className="justify-self-start text-title font-light text-ink-2 tabular-nums">{ordinal(at)}</span>
              <span className="size-36 overflow-hidden rounded-full ring-8 ring-ground">
                {photo ? (
                  <MediaImage image={photo} sizes="144px" decorative className="size-full object-cover" />
                ) : null}
              </span>
              <h3 className="text-title font-normal text-balance">{step.title.en}</h3>
              {step.text.en ? <p className="text-small whitespace-pre-line text-ink-2">{step.text.en}</p> : null}
            </li>
          );
        })}
      </ScrollTrack>
    </SectionFrame>
  );
}
