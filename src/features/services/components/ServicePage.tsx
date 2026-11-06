import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { headingId, SectionBand } from "@/components/sections/SectionFrame";
import { ServiceCards } from "@/components/sections/ServiceCards";
import { JsonLd } from "@/components/site/JsonLd";
import { IconChip } from "@/components/ui/icon-chip";
import { ArrowLink } from "@/components/ui/arrow-link";
import { RichText } from "@/components/ui/rich-text";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import { publicSiteUrl } from "@/lib/env/public";
import { breadcrumbs, serviceData } from "@/lib/seo/structured-data";
import type { SiteDocument } from "@/lib/validation";

import type { PublishedService } from "../api";
import { ServiceOpening } from "./ServiceOpening";

/** The approved editorial service page (D146), with three compact related links on pale green. */
export function ServicePage({
  service,
  related,
  images,
}: {
  service: PublishedService;
  related: readonly PublishedService[];
  site: SiteDocument | null;
  images: ReadonlyMap<string, SiteImage>;
}) {
  const { published } = service;
  const image = (ref: { mediaId: string } | null) => (ref ? (images.get(ref.mediaId) ?? null) : null);

  const siteUrl = publicSiteUrl();
  return (
    <>
      <JsonLd data={serviceData(published, siteUrl)} />
      <JsonLd
        data={breadcrumbs(
          [
            { name: PAGE_NAMES.HOME, path: ROUTES.home },
            { name: PAGE_NAMES.SERVICES, path: ROUTES.services },
            { name: published.name.en, path: ROUTES.service(published.slug) },
          ],
          siteUrl,
        )}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-section">
        <ServiceOpening service={published} image={image(published.image)} />

        <SectionBand
          anchor="about"
          tone="mist"
          className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16"
        >
          <h2 id={headingId("about")} className="text-display font-semibold text-balance">
            <RiseWords text={UI_TEXT.aboutService} />
          </h2>
          <Reveal className="grid content-start gap-8">
            <RichText blocks={published.description} headingLevel="h3" />
            {published.included.length > 0 ? (
              <div className="grid gap-4">
                <h3 className="text-title font-semibold">{UI_TEXT.whatItIncludes}</h3>
                <ul className="grid gap-3">
                  {published.included.map((item) => (
                    <li key={item.en} className="flex items-start gap-3">
                      <IconChip name="check" tone="ground" size="sm" />
                      <span className="pt-0.5">{item.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </SectionBand>

        {related.length > 0 ? (
          <div className="-mt-section">
            <SectionBand anchor="others" tone="leaf" className="grid gap-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id={headingId("others")} className="text-display font-semibold text-balance">
                  <RiseWords text={UI_TEXT.otherServices} />
                </h2>
                <ArrowLink href={ROUTES.services}>{UI_TEXT.allServices}</ArrowLink>
              </div>
              <ServiceCards services={related} image={image} compact />
            </SectionBand>
          </div>
        ) : null}
      </div>
    </>
  );
}
