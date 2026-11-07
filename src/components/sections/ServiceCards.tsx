import { InlineText } from "@/components/ui/inline-text";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";

/** Across a row: four on a wide screen, two on a tablet, one on a phone. */
const ROW = 4;
const SUMMARY_ROW = 3;

/** Concept two's related-service card: a compact photograph beside the linked title (D146). */
export function ServiceSummaryCard({ service, photo }: { service: PublishedService; photo: SiteImage | null }) {
  return (
    <Link
      href={ROUTES.service(service.published.slug)}
      className="service-summary group flex h-full min-h-28 items-center gap-4 rounded-inset bg-card p-3 shadow-raised"
    >
      {photo ? (
        <span className="relative size-24 shrink-0 overflow-hidden rounded-control">
          <MediaImage
            image={photo}
            sizes="6rem"
            decorative
            className="absolute inset-0 size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
          />
        </span>
      ) : null}
      <span className="min-w-0 text-title font-medium text-navy underline decoration-transparent underline-offset-4 group-hover:decoration-current">
        <InlineText text={service.published.name.en} />
      </span>
    </Link>
  );
}

/**
 * A service as a rounded photo card (D131): its photo filling the card, its
 * name on a soft-white label with an arrow, the whole card
 * opening its page.
 */
export function ServiceCard({
  service,
  photo,
  sizes,
  className = "aspect-[3/4]",
  photoFade = false,
}: {
  service: PublishedService;
  photo: SiteImage | null;
  sizes: string;
  /** The card's shape. */
  className?: string;
  /** Home's approved landscape pyramid: modest centred title over the photo fade, without a label card. */
  photoFade?: boolean;
}) {
  return (
    <Link
      href={ROUTES.service(service.published.slug)}
      className={`group relative block overflow-hidden rounded-card bg-leaf-pale shadow-raised ${className} ${photoFade ? "pyramid-service" : ""}`}
    >
      {photo ? (
        <MediaImage
          image={photo}
          sizes={sizes}
          decorative
          className="absolute inset-0 size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]"
        />
      ) : null}
      {photoFade ? (
        <span className="pyramid-service-name">
          <InlineText text={service.published.name.en} />
        </span>
      ) : (
        <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-inset bg-card p-3.5">
          <span className="grid gap-0.5">
            <span className="font-semibold leading-snug text-navy">
              <InlineText text={service.published.name.en} />
            </span>
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-deep text-on-deep transition-transform duration-(--duration-state) group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
            <Pictogram name="arrow" size="sm" className="rtl:rotate-180" />
          </span>
        </span>
      )}
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
  compact = false,
}: {
  services: readonly PublishedService[];
  image: (ref: { mediaId: string } | null) => SiteImage | null;
  /** The second concept's horizontal related cards, used only on a service detail page (D146). */
  compact?: boolean;
}) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${compact ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {services.map((service, at) => (
        <li key={service.id}>
          <Reveal order={at % (compact ? SUMMARY_ROW : ROW)} className={compact ? "h-full" : undefined}>
            {compact ? (
              <ServiceSummaryCard service={service} photo={image(service.published.image)} />
            ) : (
              <ServiceCard
                service={service}
                photo={image(service.published.image)}
                sizes="(min-width: 78rem) 18rem, (min-width: 64rem) 23vw, (min-width: 40rem) 46vw, 100vw"
                className="aspect-[4/3] sm:aspect-[3/4]"
              />
            )}
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
