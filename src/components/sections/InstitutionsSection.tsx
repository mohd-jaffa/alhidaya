import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/media-image";
import { PillLink } from "@/components/ui/pill";
import { PillLabel } from "@/components/ui/pill-label";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type InstitutionsContent = Extract<Section, { type: "INSTITUTIONS" }>["content"];

/**
 * The staffing offer for hospitals, clinics and schools (plan §6.1, §6.3,
 * D97): one mist card, its pill, heading and text ending on Request a quote,
 * and a photo filling its other half on a wide screen.
 */
export function InstitutionsSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: InstitutionsContent;
  image: SiteImage | null;
}) {
  return (
    <SectionFrame anchor={anchor}>
      <Reveal className="grid gap-2 rounded-card bg-mist p-2 lg:grid-cols-2">
        <div className="grid content-center justify-items-start gap-6 p-5 sm:p-8 lg:p-12">
          <PillLabel>{AUDIENCE_LABELS.INSTITUTIONS}</PillLabel>
          <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
          <p className="max-w-measure text-lead whitespace-pre-line text-ink-2">{content.text.en}</p>
          <PillLink href={ROUTES.quote} size="lg" arrow>
            {UI_TEXT.requestQuote}
          </PillLink>
        </div>
        {image ? (
          <div className="relative min-h-72 overflow-hidden rounded-[1.25rem] lg:min-h-[30rem]">
            <MediaImage
              image={image}
              sizes="(min-width: 78rem) 38rem, (min-width: 64rem) 48vw, 100vw"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        ) : null}
      </Reveal>
    </SectionFrame>
  );
}
