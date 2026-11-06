import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section } from "@/lib/validation";

import { headingId } from "./SectionFrame";
import { ServiceCard } from "./ServiceCards";
import { HomeServicesPyramid } from "./HomeServicesPyramid";
import { ServicesTrack } from "./ServicesTrack";

type ServicesRowContent = Extract<Section, { type: "SERVICES_ROW" }>["content"];

/**
 * What we do (D131, from Theme 2 in straight lines): on a mist band edge to
 * edge, the admin's heading and words beside two arrows, then every published
 * service in its order as a rounded photo card, its name on a
 * soft-white label with an arrow, opening its page; under the row, the way to
 * all of them, centred as a plain link.
 */
export function ServicesRowSection({
  anchor,
  content,
  services,
  image,
  pyramid = false,
}: {
  pyramid?: boolean;
  anchor: string;
  content: ServicesRowContent;
  services: readonly PublishedService[];
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  const opening = (
    <div className="grid max-w-[36rem] gap-3">
      <h2 id={headingId(anchor)} className="text-display font-semibold">
        <RiseWords text={content.heading.en} />
      </h2>
      {content.text.en ? <p className="text-lead text-ink-2">{content.text.en}</p> : null}
    </div>
  );
  const cards = services.map((service) => (
    <li key={service.id} className="w-[min(18.5rem,78vw)] shrink-0 snap-start">
      <ServiceCard
        service={service}
        photo={image(service.published.image)}
        sizes={pyramid ? "(min-width: 64rem) 42rem, 76vw" : "296px"}
        className={pyramid ? "aspect-[8/5]" : undefined}
        photoFade={pyramid}
      />
    </li>
  ));

  return (
    <section id={anchor} aria-labelledby={headingId(anchor)} className="grid scroll-mt-8 gap-8 bg-mist py-section">
      <Reveal>
        {pyramid ? (
          <HomeServicesPyramid>
            <div className="flex w-full flex-wrap items-end justify-between gap-6">
              {opening}
              <div className="pyramid-controls ms-auto flex shrink-0 gap-2">
                {[-1, 1].map((step) => (
                  <button
                    key={step}
                    type="button"
                    data-step={step}
                    disabled={cards.length < 2}
                    aria-label={step < 0 ? UI_TEXT.previousServices : UI_TEXT.nextServices}
                    className={`grid size-11 shrink-0 place-items-center rounded-full disabled:opacity-40 ${step < 0 ? "bg-ground text-deep ring-[1.5px] ring-rule ring-inset" : "bg-deep text-on-deep"}`}
                  >
                    <Pictogram
                      name="arrow"
                      size="sm"
                      className={step < 0 ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <ul className="pyramid-track">{cards}</ul>
          </HomeServicesPyramid>
        ) : (
          <ServicesTrack opening={opening} cards={cards} />
        )}
      </Reveal>
      <p className="text-center">
        <Link
          href={ROUTES.services}
          className="group inline-flex min-h-touch items-center gap-2 border-b-2 border-current pb-1 font-semibold text-deep"
        >
          {UI_TEXT.allServices}
          <Pictogram
            name="arrow"
            size="sm"
            className="transition-transform duration-(--duration-state) group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          />
        </Link>
      </p>
    </section>
  );
}
