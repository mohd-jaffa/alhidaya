import { Reveal } from "@/components/motion/Reveal";
import { AudienceActions } from "@/components/sections/AudienceActions";
import { PageHero } from "@/components/sections/PageHero";
import { SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";
import { ServiceCards } from "@/components/sections/ServiceCards";
import { JsonLd } from "@/components/site/JsonLd";
import { IconChip } from "@/components/ui/icon-chip";
import { RichText } from "@/components/ui/rich-text";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import type { SiteImage } from "@/features/media/types";
import { publicSiteUrl } from "@/lib/env/public";
import { breadcrumbs, serviceData } from "@/lib/seo/structured-data";
import type { SiteDocument } from "@/lib/validation";

import type { PublishedService } from "../api";

/**
 * A service's page (plan §6.4, D109, D111): its opening with who it is for on
 * its pill, its photo and its audience's actions; what the service is, with
 * who it is for and what it includes on a mist card; and the other services
 * for the same audience as photo cards.
 */
export function ServicePage({
  service,
  related,
  site,
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
      <div className="grid grid-cols-[minmax(0,1fr)] gap-section pt-16 pb-section xl:pt-12">
        <PageHero
          anchor="start"
          label={AUDIENCE_LABELS[published.audience]}
          headline={published.name.en}
          lede={published.summary.en}
          image={image(published.image)}
        >
          <AudienceActions audience={published.audience} site={site} service={published.slug} size="lg" />
        </PageHero>

        <SectionFrame
          anchor="about"
          className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:gap-16"
        >
          <Reveal className="grid content-start gap-6">
            <SectionHeading anchor="about">{UI_TEXT.aboutService}</SectionHeading>
            <RichText blocks={published.description} headingLevel="h3" />
          </Reveal>
          {published.forWhom.en || published.included.length > 0 ? (
            <Reveal order={1} className="grid content-start gap-8 rounded-card bg-mist p-6 sm:p-8">
              {published.forWhom.en ? (
                <div className="grid gap-3">
                  <h3 className="text-title font-medium">{UI_TEXT.whoItIsFor}</h3>
                  <p className="whitespace-pre-line text-ink-2">{published.forWhom.en}</p>
                </div>
              ) : null}
              {published.included.length > 0 ? (
                <div className="grid gap-4">
                  <h3 className="text-title font-medium">{UI_TEXT.whatItIncludes}</h3>
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
          ) : null}
        </SectionFrame>

        {related.length > 0 ? (
          <SectionFrame anchor="others" className="grid gap-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading anchor="others">{UI_TEXT.otherServices}</SectionHeading>
              <div className="flex flex-wrap gap-3">
                <AudienceActions audience={published.audience} site={site} service={published.slug} />
              </div>
            </div>
            <ServiceCards services={related} image={image} />
          </SectionFrame>
        ) : null}
      </div>
    </>
  );
}
