import { TheLine } from "@/components/motion/TheLine";
import { JsonLd } from "@/components/site/JsonLd";
import { SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";
import { LineActions, SERVICE_LINES, ServiceStops } from "@/components/sections/ServiceLine";
import { ImageFrame } from "@/components/ui/frames";
import { LineRow } from "@/components/ui/line-row";
import { MediaImage } from "@/components/ui/media-image";
import { Pictogram } from "@/components/ui/pictogram";
import { RichText } from "@/components/ui/rich-text";
import { SignPanel } from "@/components/ui/sign-panel";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import { publicSiteUrl } from "@/lib/env/public";
import { breadcrumbs, serviceData } from "@/lib/seo/structured-data";
import type { SiteDocument } from "@/lib/validation";

import type { PublishedService } from "../api";

/**
 * A service's page (plan §6.4): its sign in its line's colour with the line's
 * actions; what the service is, who it is for and what it includes; and the
 * line it runs on, with its actions and the other services on it.
 */
export function ServicePage({
  service,
  related,
  site,
  image,
}: {
  service: PublishedService;
  related: readonly PublishedService[];
  site: SiteDocument | null;
  image: SiteImage | null;
}) {
  const { published } = service;
  const line = SERVICE_LINES[published.audience];
  const stations = [
    { id: "start", label: published.name.en },
    { id: "about", label: UI_TEXT.aboutService },
    { id: "line", label: line.title },
  ];

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
      <TheLine stations={stations} tone={line.tone} />
      <div className="grid gap-section pt-16 pb-section xl:pt-12">
        <div id="start" className="mx-auto w-full max-w-site px-gutter">
          <SignPanel
            tone={line.tone}
            headline={published.name.en}
            lede={published.summary.en}
            media={
              image ? (
                <ImageFrame ratio="landscape">
                  <MediaImage image={image} sizes="(min-width: 78rem) 34rem, (min-width: 64rem) 40vw, 100vw" priority />
                </ImageFrame>
              ) : null
            }
          >
            <LineActions
              audience={published.audience}
              site={site}
              service={published.slug}
              look={line.tone === "sky" ? "skySign" : "deepSign"}
            />
          </SignPanel>
        </div>

        <SectionFrame anchor="about" className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-6">
            <SectionHeading anchor="about">{UI_TEXT.aboutService}</SectionHeading>
            <RichText blocks={published.description} headingLevel="h3" />
          </div>
          {published.forWhom.en || published.included.length > 0 ? (
            <div className="grid content-start gap-8 rounded-panel bg-mist p-sign">
              {published.forWhom.en ? (
                <div className="grid gap-3">
                  <h3 className="text-title font-bold">{UI_TEXT.whoItIsFor}</h3>
                  <p className="whitespace-pre-line">{published.forWhom.en}</p>
                </div>
              ) : null}
              {published.included.length > 0 ? (
                <div className="grid gap-3">
                  <h3 className="text-title font-bold">{UI_TEXT.whatItIncludes}</h3>
                  <ul className="grid gap-3">
                    {published.included.map((item) => (
                      <li key={item.en} className="flex gap-3">
                        <Pictogram name="check" size="md" className="text-deep" />
                        <span>{item.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </SectionFrame>

        <SectionFrame anchor="line" named={false}>
          <LineRow tone={line.tone} pictogram={line.pictogram} title={line.title}>
            <LineActions audience={published.audience} site={site} service={published.slug} look="row" />
          </LineRow>
          {related.length > 0 ? <ServiceStops tone={line.tone} services={related} /> : null}
        </SectionFrame>
      </div>
    </>
  );
}
