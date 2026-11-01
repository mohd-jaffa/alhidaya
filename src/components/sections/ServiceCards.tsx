import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";

/** Across a row: four on a wide screen, two on a tablet, one on a phone. */
const ROW = 4;

/**
 * A service as a rounded photo card (D131): its photo filling the card, its
 * audience and name on a soft-white label with an arrow, the whole card
 * opening its page.
 */
export function ServiceCard({
  service,
  photo,
  sizes,
  className = "aspect-[3/4]",
}: {
  service: PublishedService;
  photo: SiteImage | null;
  sizes: string;
  /** The card's shape. */
  className?: string;
}) {
  const institutions = service.published.audience === "INSTITUTIONS";
  return (
    <Link
      href={ROUTES.service(service.published.slug)}
      className={`group relative block overflow-hidden rounded-card bg-leaf-pale shadow-raised ${className}`}
    >
      {photo ? (
        <MediaImage
          image={photo}
          sizes={sizes}
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
  );
}

/**
 * Services as Home's cards in a grid (plan §6.3, D135): four across on a
 * wide screen, two on a tablet, one on a phone (there a wider card); a row
 * rises in one card after another.
 */
export function ServiceCards({
  services,
  image,
}: {
  services: readonly PublishedService[];
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service, at) => (
        <li key={service.id}>
          <Reveal order={at % ROW}>
            <ServiceCard
              service={service}
              photo={image(service.published.image)}
              sizes="(min-width: 78rem) 18rem, (min-width: 64rem) 23vw, (min-width: 40rem) 46vw, 100vw"
              className="aspect-[4/3] sm:aspect-[3/4]"
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
