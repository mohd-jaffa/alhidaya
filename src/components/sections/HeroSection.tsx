import { SettleText } from "@/components/motion/SettleText";
import { Avatars } from "@/components/ui/avatars";
import { IconChip } from "@/components/ui/icon-chip";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import { whatsappHref } from "@/lib/contact";
import type { Section, SiteDocument } from "@/lib/validation";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

/**
 * Home's hero (plan §30.1, D97): on the left, faces between round brackets,
 * the headline settling into its words with one phrase on a pale-green
 * highlight, the supporting line, WhatsApp and the quote, and a card of faces
 * with a real fact (D99); on the right, a tall care photo with word chips at
 * its top and two cards floating at its foot. The photo is the page's first
 * paint. On a phone the photo follows the words.
 */
export function HeroSection({
  anchor,
  content,
  image,
  site,
}: {
  anchor: string;
  content: SignContent;
  image: (ref: { mediaId: string } | null) => SiteImage | null;
  site: SiteDocument | null;
}) {
  const photo = image(content.image);
  const faces = content.avatars.map(image).filter((face): face is SiteImage => face !== null);
  const cardPhoto = image(content.card.image);
  const { fact, note, card } = content;

  return (
    <section id={anchor} className="mx-auto w-full max-w-site px-gutter pt-2">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.04fr] lg:gap-14">
        <div className="flex flex-col justify-between gap-12 lg:py-6">
          <div className="grid gap-7 lg:gap-9">
            {faces.length > 0 ? (
              <div aria-hidden="true" className="flex items-center gap-2 text-figure font-extralight text-navy">
                <span>(</span>
                <Avatars images={faces.slice(0, 3)} size="md" />
                <span>)</span>
              </div>
            ) : null}
            <h1 className="max-w-[18ch] text-hero font-normal">
              <SettleText text={content.headline.en} highlight={content.highlight.en} />
            </h1>
            {content.lede.en ? (
              <p className="max-w-[36ch] text-lead whitespace-pre-line text-ink-2">{content.lede.en}</p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {site ? (
                <PillLink href={whatsappHref(site.contact.whatsapp, UI_TEXT.whatsappPrefill)} size="lg" arrow>
                  {UI_TEXT.whatsapp}
                </PillLink>
              ) : null}
              <PillLink href={ROUTES.quote} variant="pale" size="lg">
                {UI_TEXT.requestQuote}
              </PillLink>
            </div>
          </div>
          {fact.value.en ? (
            <div className="flex items-center gap-4 self-start rounded-card bg-mist p-3 pe-7">
              <Avatars images={faces} size="md" />
              <p className="grid">
                <span className="text-title font-medium">{fact.value.en}</span>
                {fact.label.en ? <span className="text-small text-ink-2">{fact.label.en}</span> : null}
              </p>
            </div>
          ) : null}
        </div>

        <div className="relative min-h-[30rem] overflow-hidden rounded-frame bg-mist sm:min-h-[36rem] lg:min-h-[40rem]">
          {photo ? (
            <MediaImage
              image={photo}
              sizes="(min-width: 78rem) 40rem, (min-width: 64rem) 52vw, 100vw"
              priority
              className="absolute inset-0 size-full object-cover"
            />
          ) : null}
          {content.chips.length > 0 ? (
            <ul className="absolute start-4 top-4 grid justify-items-start gap-2 sm:start-6 sm:top-6">
              {content.chips.map((chip, at) => (
                <li
                  key={chip.en}
                  className={`flex items-center gap-1.5 rounded-pill bg-ground/75 py-1.5 ps-4 pe-1.5 text-small font-medium text-navy ${at % 2 === 1 ? "ms-6" : ""}`}
                >
                  {chip.en}
                  <span
                    aria-hidden="true"
                    className="grid size-6 place-items-center rounded-full bg-leaf-pale text-forest"
                  >
                    <Pictogram name="check" className="size-3.5" />
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {card.title.en || note.text.en ? (
            <div className="absolute inset-x-4 bottom-4 grid justify-items-end gap-2.5 sm:inset-x-6 sm:bottom-6">
              {card.title.en ? (
                <div className="flex w-full max-w-[19rem] items-center gap-3 rounded-card bg-ground p-2.5 shadow-float">
                  {cardPhoto ? (
                    <div className="size-16 shrink-0 overflow-hidden rounded-thumb">
                      <MediaImage image={cardPhoto} sizes="64px" decorative className="size-full object-cover" />
                    </div>
                  ) : null}
                  <p className="grid gap-1.5">
                    <span className="font-medium">{card.title.en}</span>
                    {card.tag.en ? (
                      <span className="justify-self-start rounded-pill bg-mist px-2.5 py-0.5 text-small text-ink-2">
                        {card.tag.en}
                      </span>
                    ) : null}
                  </p>
                </div>
              ) : null}
              {note.text.en ? (
                <p className="flex w-full max-w-[19rem] items-center gap-3 rounded-pill bg-ground p-1.5 pe-5 shadow-float">
                  {note.pictogram ? <IconChip name={note.pictogram} tone="forest" /> : null}
                  <span className="font-medium">{note.text.en}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
