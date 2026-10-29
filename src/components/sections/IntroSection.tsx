import { ImageFrame } from "@/components/ui/frames";
import { MediaImage } from "@/components/ui/media-image";
import { RichText } from "@/components/ui/rich-text";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionHeading } from "./SectionFrame";

type IntroContent = Extract<Section, { type: "INTRO" }>["content"];

/** Who the company is (plan §6.1, §6.2): a heading, the admin's text, and a photo beside it on a wide screen. */
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
    <SectionFrame anchor={anchor} className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
      <div className="grid content-start gap-6">
        <SectionHeading anchor={anchor}>{content.heading.en}</SectionHeading>
        <RichText blocks={content.body} headingLevel="h3" />
      </div>
      {image ? (
        <ImageFrame ratio="portrait">
          <MediaImage image={image} sizes="(min-width: 78rem) 34rem, (min-width: 64rem) 42vw, 100vw" />
        </ImageFrame>
      ) : null}
    </SectionFrame>
  );
}
