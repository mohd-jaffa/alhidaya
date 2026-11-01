import { Words } from "@/components/motion/Words";
import { IconChip } from "@/components/ui/icon-chip";
import { MediaImage } from "@/components/ui/media-image";
import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";

import { HeroSlides } from "./HeroSlides";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

/**
 * Home's hero (D128, from Theme 6): the admin's slides, in straight lines.
 * On the left, the slide's headline (its phrase in deep blue), its line and
 * its button when it has one, above the slides' controls; on the right, its
 * photo edge to edge, the card on the photo at its foot. The first photo is
 * the page's first paint; on a phone the photo comes first.
 */
export function HeroSection({
  anchor,
  content,
  image,
}: {
  anchor: string;
  content: SignContent;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  const { slides, note } = content;
  const photos = slides.map((slide, index) => {
    const photo = image(slide.image);
    return photo ? (
      <MediaImage
        key={index}
        image={photo}
        sizes="(min-width: 64rem) 52vw, 100vw"
        priority={index === 0}
        className="absolute inset-0 size-full object-cover"
      />
    ) : (
      <div key={index} className="size-full bg-mist" />
    );
  });
  const texts = slides.map((slide, index) => (
    <div key={index} className="grid justify-items-start gap-6">
      <h1 className="max-w-[16ch] text-hero font-semibold text-navy">
        <Words text={slide.headline.en} highlight={slide.highlight.en} />
      </h1>
      {slide.text.en ? (
        <p className="slide-line max-w-[34ch] text-lead whitespace-pre-line text-ink-2">{slide.text.en}</p>
      ) : null}
      {slide.buttonLabel.en && slide.buttonHref.en ? (
        <PillLink href={slide.buttonHref.en} size="lg" arrow className="slide-line">
          {slide.buttonLabel.en}
        </PillLink>
      ) : null}
    </div>
  ));
  const card = note.text.en ? (
    <p className="absolute start-4 bottom-4 z-10 flex items-center gap-3 rounded-card bg-card p-2.5 pe-5 shadow-float sm:start-6 sm:bottom-6">
      {note.pictogram ? <IconChip name={note.pictogram} tone="leaf" /> : null}
      <span className="font-semibold">{note.text.en}</span>
    </p>
  ) : null;

  return (
    <div id={anchor}>
      <HeroSlides label={UI_TEXT.slidesLabel} photos={photos} texts={texts} note={card} />
    </div>
  );
}
