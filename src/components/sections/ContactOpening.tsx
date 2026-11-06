import { TypewriterText } from "@/components/motion/TypewriterText";
import type { Section } from "@/lib/validation";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

/** Contact's approved white, type-led opening (D145); the stored photo is retained in the CMS. */
export function ContactOpening({ anchor, content }: { anchor: string; content: SignContent }) {
  return (
    <section id={anchor} className="contact-opening bg-ground">
      <div className="page-split mx-auto grid w-full max-w-site gap-6 px-gutter py-12 sm:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16">
        <h1 className="max-w-split text-hero font-semibold text-balance text-navy">
          <TypewriterText text={content.headline.en} />
        </h1>
        {content.lede.en ? (
          <p className="split-line max-w-page-lede text-lead whitespace-pre-line text-ink-2">{content.lede.en}</p>
        ) : null}
      </div>
    </section>
  );
}
