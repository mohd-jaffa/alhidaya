import Link from "next/link";

import { LoopRow } from "@/components/motion/LoopRow";
import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { PillLink } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionOpening } from "./SectionFrame";

type ServicesRowContent = Extract<Section, { type: "SERVICES_ROW" }>["content"];

/**
 * Our services (D124): its pill and heading, then every published service in
 * its order, each a photo card opening its page, running past in an endless
 * loop that reaches the window's edges on a wide screen; under it, a small
 * All services pill and the loop's pause button.
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
  return (
    <SectionFrame anchor={anchor} className="grid gap-12">
      <Reveal>
        <SectionOpening
          anchor={anchor}
          label={content.label.en}
          start={content.headingStart.en}
          pictogram={content.pictogram}
          end={content.headingEnd.en}
        />
      </Reveal>
      <LoopRow
        secondsPerItem={5}
        pauseLabel={UI_TEXT.pauseServices}
        viewClassName="-mx-gutter lg:mx-[calc(50%_-_50vw)]"
        listClassName="gap-4"
        footer={
          <PillLink href={ROUTES.services} variant="pale" arrow>
            {UI_TEXT.allServices}
          </PillLink>
        }
        items={services.map((service) => {
          const photo = image(service.published.image);
          return (
            <li key={service.id} className="shrink-0">
              <Link
                href={ROUTES.service(service.published.slug)}
                className="group grid w-52 gap-3 rounded-card bg-mist p-2 pb-4 sm:w-60"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-inset bg-leaf-pale">
                  {photo ? (
                    <MediaImage
                      image={photo}
                      sizes="240px"
                      decorative
                      className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-reveal) ease-out group-hover:scale-[1.04]"
                    />
                  ) : null}
                </span>
                <span className="flex items-start justify-between gap-2 px-2 font-medium">
                  {service.published.name.en}
                  <Pictogram
                    name="arrow"
                    size="sm"
                    className="mt-0.5 shrink-0 text-forest transition-transform duration-(--duration-state) group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      />
    </SectionFrame>
  );
}
