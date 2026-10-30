import { Reveal } from "@/components/motion/Reveal";
import { ImageFrame } from "@/components/ui/frames";
import { MediaImage } from "@/components/ui/media-image";
import { RichText } from "@/components/ui/rich-text";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type IntroContent = Extract<Section, { type: "INTRO" }>["content"];

/**
 * Who the company is (plan §6.1, §6.2): a heading, the admin's text, and a
 * tall photo beside it on a wide screen, each rising in.
 */
export function IntroSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: IntroContent;
  image: SiteImage | null;
}) {
  return (
    <SectionFrame
      anchor={anchor}
      className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-16"
    >
      <Reveal className="grid content-start gap-6">
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
        <RichText blocks={content.body} headingLevel="h3" />
      </Reveal>
      {image ? (
        <Reveal order={1}>
          <ImageFrame ratio="portrait">
            <MediaImage image={image} sizes="(min-width: 78rem) 36rem, (min-width: 64rem) 44vw, 100vw" />
          </ImageFrame>
        </Reveal>
      ) : null}
    </SectionFrame>
  );
}
