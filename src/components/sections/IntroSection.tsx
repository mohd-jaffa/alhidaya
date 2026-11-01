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
 * lead and the rest beneath, the points as a ruled list, each beside a check,
 * and on Home the way to the About page.
 */
export function IntroSection({
  anchor,
  content,
  image,
  more = null,
}: {
  anchor: string;
  content: IntroContent;
  image: SiteImage | null;
  /** Where "Read more about us" leads, or null for none (the About page itself). */
  more?: string | null;
}) {
  const [lead, ...rest] = content.body;
  return (
    <SectionFrame anchor={anchor} className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
      <div className="grid content-start gap-8">
        <h2 id={headingId(anchor)} className="text-display font-medium">
          <RiseWords text={content.heading.en} highlight={content.highlight.en} />
        </h2>
        {image ? (
          <Reveal>
            <ImageFrame ratio="portrait">
              <MediaImage image={image} sizes="(min-width: 78rem) 30rem, (min-width: 64rem) 36vw, 100vw" />
            </ImageFrame>
          </Reveal>
        ) : null}
      </div>
      <Reveal className="grid content-start gap-4">
        {lead?.type === "paragraph" ? <p className="text-lead whitespace-pre-line text-navy">{lead.text.en}</p> : null}
        {/* The rest of the admin's text, its headings, lists and links too, in the quieter ink. */}
        <div className="text-ink-2">
          <RichText blocks={lead?.type === "paragraph" ? rest : content.body} headingLevel="h3" />
        </div>
        {content.points.length > 0 ? (
          <ul className="mt-4 border-t border-rule">
            {content.points.map((point) => (
              <li
                key={point.title.en}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 border-b border-rule py-4 sm:grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1.3fr)] sm:items-center"
              >
                <Pictogram name="check" size="sm" className="mt-0.5 text-forest sm:mt-0" />
                <span className="font-semibold text-navy">{point.title.en}</span>
                {point.text.en ? <span className="text-ink-2 max-sm:col-start-2">{point.text.en}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {more ? (
          <Link
            href={more}
            className="group mt-4 inline-flex items-center gap-2 justify-self-start border-b-2 border-current pb-1 font-semibold text-deep"
          >
            {UI_TEXT.readAboutUs}
            <Pictogram
              name="arrow"
              size="sm"
              className="transition-transform duration-(--duration-state) group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </Link>
        ) : null}
      </Reveal>
    </SectionFrame>
  );
}
