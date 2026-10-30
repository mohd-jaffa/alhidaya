import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { ScrollTrack } from "@/components/motion/ScrollTrack";
import { IconChip } from "@/components/ui/icon-chip";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { PublishedService } from "@/features/services/api";
import type { Section } from "@/lib/validation";

import { SectionFrame, SectionOpening } from "./SectionFrame";

type FamiliesContent = Extract<Section, { type: "FOR_FAMILIES" }>["content"];

/**
 * For families (plan §30.1, D97, D102, D105): its pill and heading, then the
 * services sliding through a large card as the section scrolls by, each
 * opening its page; beside it a photo with its words, and small feature cards.
 */
export function ForFamiliesSection({
  anchor,
  content,
  services,
  image,
}: {
  anchor: string;
  content: FamiliesContent;
  services: readonly PublishedService[];
  image: (ref: { mediaId: string } | null) => SiteImage | null;
}) {
  const photo = image(content.photo.image);
  return (
    <SectionFrame anchor={anchor} className="grid gap-12 py-section">
      <Reveal>
        <SectionOpening
          anchor={anchor}
          label={content.label.en}
          start={content.headingStart.en}
          pictogram={content.pictogram}
          end={content.headingEnd.en}
        />
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Reveal className="flex min-h-[26rem] flex-col justify-between gap-6 overflow-hidden rounded-card bg-mist py-6">
          <ScrollTrack as="ul" className="px-6" trackClassName="gap-3 pe-6">
            {services.map((service) => {
              const servicePhoto = image(service.published.image);
              return (
                <li key={service.id} className="shrink-0">
                  <Link
                    href={ROUTES.service(service.published.slug)}
                    className="group grid w-44 gap-3 rounded-[1.25rem] bg-ground p-2 pb-4 sm:w-52"
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[1rem] bg-leaf-pale">
                      {servicePhoto ? (
                        <MediaImage
                          image={servicePhoto}
                          sizes="208px"
                          decorative
                          className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-reveal) ease-out group-hover:scale-[1.04]"
                        />
                      ) : null}
                    </span>
                    <span className="flex items-start justify-between gap-2 px-1.5 font-medium">
                      {service.published.name.en}
                      <Pictogram
                        name="arrow"
                        size="sm"
                        className="mt-0.5 text-forest transition-transform duration-(--duration-state) group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ScrollTrack>
          <p className="px-6 text-small font-medium text-ink-2">{UI_TEXT.services}</p>
        </Reveal>
        <div className="grid gap-4">
          <Reveal order={1} className="relative min-h-64 overflow-hidden rounded-card bg-mist">
            {photo ? (
              <MediaImage
                image={photo}
                sizes="(min-width: 64rem) 34vw, 100vw"
                decorative={Boolean(content.photo.text.en)}
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            {content.photo.text.en ? (
              <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy/85 to-transparent p-5 pt-16 text-body whitespace-pre-line text-on-deep">
                {content.photo.text.en}
              </p>
            ) : null}
          </Reveal>
          {content.features.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {content.features.map((feature, at) => (
                <li key={feature.title.en}>
                  <Reveal
                    order={at + 2}
                    className="flex h-full min-h-36 flex-col justify-between gap-6 rounded-card bg-mist p-5"
                  >
                    {feature.pictogram ? <IconChip name={feature.pictogram} tone="ground" /> : <span />}
                    <h3 className="font-medium">{feature.title.en}</h3>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </SectionFrame>
  );
}
