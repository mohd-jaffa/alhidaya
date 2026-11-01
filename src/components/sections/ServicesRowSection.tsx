import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section } from "@/lib/validation";

import { headingId } from "./SectionFrame";
import { ServicesTrack } from "./ServicesTrack";

type ServicesRowContent = Extract<Section, { type: "SERVICES_ROW" }>["content"];

/**
 * What we do (D131, from Theme 2 in straight lines): on a mist band edge to
 * edge, the admin's heading and words beside two arrows, then every published
 * service in its order as a rounded photo card, its audience and name on a
 * soft-white label with an arrow, opening its page; under the row, the way to
 * all of them, centred as a plain link.
 */
export function ServicesRowSection({
  anchor,
  content,
  services,
  image,
}: {
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
  const cards = services.map((service) => {
    const photo = image(service.published.image);
    const institutions = service.published.audience === "INSTITUTIONS";
    return (
      <li key={service.id} className="w-[min(18.5rem,78vw)] shrink-0 snap-start">
        <Link
          href={ROUTES.service(service.published.slug)}
          className="group relative block aspect-[3/4] overflow-hidden rounded-card bg-leaf-pale shadow-raised"
        >
          {photo ? (
            <MediaImage
              image={photo}
              sizes="296px"
              decorative
              className="absolute inset-0 size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
            />
          ) : null}
          <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-inset bg-card p-3.5">
            <span className="grid gap-0.5">
              <span className={`text-small font-semibold ${institutions ? "text-deep" : "text-forest"}`}>
                {AUDIENCE_LABELS[service.published.audience]}
              </span>
              <span className="font-semibold leading-snug text-navy">{service.published.name.en}</span>
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-deep text-on-deep transition-transform duration-(--duration-state) group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
              <Pictogram name="arrow" size="sm" className="rtl:rotate-180" />
            </span>
          </span>
        </Link>
      </li>
    );
  });

  return (
    <section id={anchor} aria-labelledby={headingId(anchor)} className="grid scroll-mt-8 gap-8 bg-mist py-section">
      <Reveal>
        <ServicesTrack opening={opening} cards={cards} />
      </Reveal>
      <p className="text-center">
        <Link
          href={ROUTES.services}
          className="group inline-flex items-center gap-2 border-b-2 border-current pb-1 font-semibold text-deep"
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
