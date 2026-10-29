import { ButtonLink } from "@/components/ui/button";
import { ImageFrame } from "@/components/ui/frames";
import { LineEdge } from "@/components/ui/line-edge";
import { MediaImage } from "@/components/ui/media-image";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type InstitutionsContent = Extract<Section, { type: "INSTITUTIONS" }>["content"];

/**
 * The staffing offer for hospitals, clinics and schools (plan §6.1, §6.3), on
 * the deep-blue line: its heading and text, a photo beside them on a wide
 * screen, and it ends on Request a Quote.
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
      <div className="relative grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <LineEdge tone="deep" />
        <div className="grid content-start gap-5">
          <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
          <p className="max-w-measure text-lead whitespace-pre-line text-ink-2">{content.text.en}</p>
          <div className="pt-2">
            <ButtonLink href={ROUTES.quote} size="lg" pictogram="staffing">
              {UI_TEXT.requestQuote}
            </ButtonLink>
          </div>
        </div>
        {image ? (
          <ImageFrame ratio="landscape">
            <MediaImage image={image} sizes="(min-width: 78rem) 38rem, (min-width: 64rem) 46vw, 100vw" />
          </ImageFrame>
        ) : null}
      </div>
    </SectionFrame>
  );
}
