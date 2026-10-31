import { LoopRow } from "@/components/motion/LoopRow";
import { Reveal } from "@/components/motion/Reveal";
import { IconChip } from "@/components/ui/icon-chip";
import { MediaImage } from "@/components/ui/media-image";
import { PillLabel } from "@/components/ui/pill-label";
import { UI_TEXT } from "@/constants/messages";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { ordinal } from "./numbered";
import { SectionFrame, SectionOpening } from "./SectionFrame";

type FamiliesContent = Extract<Section, { type: "FOR_FAMILIES" }>["content"];

/**
 * For families (plan §30.1, D97, D105, D124): its pill and heading, then how
 * it works in a large card: its label on a white pill, then the steps in
 * order, each numbered with its photo, title and words, running past in an
 * endless loop that fades at the card's edges, with its pause button below;
 * beside it a photo with its words, and small feature cards.
 */
export function ForFamiliesSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: FamiliesContent;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  const photo = image(content.photo.image);
  return (
    <SectionFrame anchor={anchor} className="grid gap-12">
      <Reveal>
        <SectionOpening
          anchor={anchor}
          label={content.label.en}
          start={content.headingStart.en}
          pictogram={content.pictogram}
          end={content.headingEnd.en}
        />
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Reveal className="flex min-h-[26rem] flex-col justify-center gap-6 overflow-hidden rounded-card bg-mist py-6">
          {content.stepsLabel.en ? (
            <div className="mx-6">
              <PillLabel as="h3">{content.stepsLabel.en}</PillLabel>
            </div>
          ) : null}
          <LoopRow
            as="ol"
            secondsPerItem={8}
            pauseLabel={UI_TEXT.pauseSteps}
            className="gap-6"
            listClassName="gap-3"
            barClassName="px-6"
            items={content.steps.map((step, at) => {
              const photo = image(step.image);
              return (
                <li
                  key={step.title.en}
                  className="grid w-52 shrink-0 content-start gap-3 rounded-inset bg-ground p-2 pb-4 sm:w-60"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-thumb bg-leaf-pale">
                    {photo ? (
                      <MediaImage
                        image={photo}
                        sizes="240px"
                        decorative
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="grid gap-1 px-1.5">
                    <span className="text-small font-light text-ink-2 tabular-nums">{ordinal(at)}</span>
                    <h4 className="font-medium text-balance">{step.title.en}</h4>
                    {step.text.en ? <p className="text-small whitespace-pre-line text-ink-2">{step.text.en}</p> : null}
                  </span>
                </li>
              );
            })}
          />
        </Reveal>
        <div className="grid gap-4">
          <Reveal order={1} className="relative min-h-64 overflow-hidden rounded-card bg-mist">
            {photo ? (
              <MediaImage
                image={photo}
                sizes="(min-width: 64rem) 34vw, 100vw"
                decorative={Boolean(content.photo.text.en)}
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            {content.photo.text.en ? (
              <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy/85 to-transparent p-5 pt-16 text-body whitespace-pre-line text-on-deep">
                {content.photo.text.en}
              </p>
            ) : null}
          </Reveal>
          {content.features.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {content.features.map((feature, at) => (
                <li key={feature.title.en}>
                  <Reveal
                    order={at + 2}
                    className="flex h-full min-h-36 flex-col justify-between gap-6 rounded-card bg-mist p-5"
                  >
                    {feature.pictogram ? <IconChip name={feature.pictogram} tone="ground" /> : <span />}
                    <h3 className="font-medium">{feature.title.en}</h3>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </SectionFrame>
  );
}
