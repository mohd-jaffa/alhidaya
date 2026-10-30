import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";

/** Across a row: four on a wide screen, two on a tablet, one on a phone. */
const ROW = 4;

/**
 * Services as cards (plan §6.3, D111): each its photo, its name with an
 * arrow (the whole card opens its page) and its summary, on a mist card; a
 * row rises in one card after another. On a phone each is a row, its photo
 * small beside its words.
 */
export function ServiceCards({
  services,
  image,
}: {
  services: readonly PublishedService[];
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service, at) => {
        const photo = image(service.published.image);
        return (
          <li key={service.id}>
            <Reveal
              order={at % ROW}
              className="group relative grid h-full grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 rounded-card bg-mist p-2 sm:grid-cols-1 sm:content-start sm:items-stretch sm:pb-6"
            >
              <span className="relative block aspect-square overflow-hidden rounded-inset bg-leaf-pale sm:aspect-[4/3]">
                {photo ? (
                  <MediaImage
                    image={photo}
                    sizes="(min-width: 78rem) 18rem, (min-width: 64rem) 23vw, (min-width: 40rem) 46vw, 96px"
                    decorative
                    className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-reveal) ease-out group-hover:scale-[1.04]"
                  />
                ) : null}
              </span>
              <div className="grid gap-1 py-2 pe-2 sm:gap-2 sm:px-3 sm:py-0">
                <p className="flex items-start justify-between gap-3 text-title font-medium">
                  <Link
                    href={ROUTES.service(service.published.slug)}
                    className="underline decoration-transparent underline-offset-4 group-hover:decoration-current after:absolute after:inset-0 after:rounded-card"
                  >
                    {service.published.name.en}
                  </Link>
                  <Pictogram
                    name="arrow"
                    size="sm"
                    className="mt-1 shrink-0 text-forest transition-transform duration-(--duration-state) ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  />
                </p>
                <p className="text-small text-ink-2">{service.published.summary.en}</p>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
