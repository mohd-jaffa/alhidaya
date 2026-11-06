import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { ImageFrame } from "@/components/ui/frames";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { RichText } from "@/components/ui/rich-text";
import { UI_TEXT } from "@/constants/messages";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { headingId, SectionFrame } from "./SectionFrame";

type IntroContent = Extract<Section, { type: "INTRO" }>["content"];

/**
 * Who the company is (plan §6.1, §6.2, D129, from Theme 5): its heading large
 * on the left, its phrase in deep blue, rising in word by word, with the photo
 * under it when there is one; on the right, the admin's first paragraph as the
 * lead and the rest beneath. Home groups plain points in one full-width
 * card; other placements keep their checks and ruled list.
 */
export function IntroSection({
  anchor,
  content,
  image,
  more = null,
  alignToPhoto = false,
  pointCards = false,
}: {
  anchor: string;
  content: IntroContent;
  image: SiteImage | null;
  /** Where "Read more about us" leads, or null for none (the About page itself). */
  more?: string | null;
  /** About: start the description beside the photo, below the separate heading row. */
  alignToPhoto?: boolean;
  /** Home: the points share a full-width card below the introduction. */
  pointCards?: boolean;
}) {
  const [lead, ...rest] = content.body;
  const groupedPoints = pointCards && content.points.length > 0;
  const points =
    content.points.length > 0 ? (
      <ul
        className={
          groupedPoints
            ? "grid min-w-0 gap-6 rounded-card bg-card p-6 shadow-raised md:grid-cols-3 md:gap-8 md:p-8"
            : "mt-4 border-t border-rule"
        }
      >
        {content.points.map((point) => (
          <li
            key={point.title.en}
            className={
              groupedPoints
                ? "grid min-w-0 content-start gap-2"
                : "grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 border-b border-rule py-4 sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-center"
            }
          >
            {!groupedPoints ? <Pictogram name="check" size="sm" className="mt-0.5 text-forest sm:mt-0" /> : null}
            <span className="font-semibold text-navy">{point.title.en}</span>
            {point.text.en ? (
              <span className={groupedPoints ? "text-ink-2" : "text-ink-2 max-sm:col-start-2"}>{point.text.en}</span>
            ) : null}
          </li>
        ))}
      </ul>
    ) : null;
  const moreLink = more ? (
    <Link
      href={more}
      className="group mt-4 inline-flex min-h-touch items-center gap-2 justify-self-start border-b-2 border-current pb-1 font-semibold text-deep"
    >
      {UI_TEXT.readAboutUs}
      <Pictogram
        name="arrow"
        size="sm"
        className="transition-transform duration-(--duration-state) group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
      />
    </Link>
  ) : null;
  return (
    <SectionFrame
      anchor={anchor}
      className={`intro-section grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 ${alignToPhoto && image ? "intro-align-photo" : ""} ${groupedPoints ? "lg:gap-y-10" : ""}`}
    >
      <div className="intro-heading-photo grid content-start gap-8">
        <h2 id={headingId(anchor)} className="text-display font-medium">
          <RiseWords text={content.heading.en} highlight={content.highlight.en} />
        </h2>
        {image ? (
          <Reveal className="intro-photo">
            <ImageFrame ratio="portrait">
              <MediaImage image={image} sizes="(min-width: 78rem) 30rem, (min-width: 64rem) 36vw, 100vw" />
            </ImageFrame>
          </Reveal>
        ) : null}
      </div>
      <Reveal className="intro-copy grid content-start gap-4">
        {lead?.type === "paragraph" ? <p className="text-lead whitespace-pre-line text-navy">{lead.text.en}</p> : null}
        {/* The rest of the admin's text, its headings, lists and links too, in the quieter ink. */}
        <div className="text-ink-2">
          <RichText blocks={lead?.type === "paragraph" ? rest : content.body} headingLevel="h3" />
        </div>
        {!groupedPoints ? points : null}
        {!groupedPoints ? moreLink : null}
      </Reveal>
      {groupedPoints ? (
        <Reveal className="intro-point-card grid min-w-0 gap-4 lg:col-span-2">
          {points}
          {moreLink}
        </Reveal>
      ) : null}
    </SectionFrame>
  );
}
