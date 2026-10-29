import type { Metadata } from "next";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { orderingDocumentKey } from "@/constants/sections";
import { getImages } from "@/features/media/api";
import type { SiteImage } from "@/features/media/types";
import { getPublishedSite } from "@/features/settings/api";
import { readPublishedDocument } from "@/lib/content/documents";
import { inOrder } from "@/lib/content/ordering";
import { findPublishedRecord, listPublishedRecords, type PublishedRecord } from "@/lib/content/records";
import { renderShareImage } from "@/lib/seo/share-image";
import type { OrderingDocument, ServiceDocument, SiteDocument } from "@/lib/validation";

export type PublishedService = PublishedRecord<ServiceDocument>;

/** Every published service, in the published order (plan §8, D59). */
export async function listPublishedServices(): Promise<PublishedService[]> {
  const [services, order] = await Promise.all([
    listPublishedRecords<ServiceDocument>("SERVICES"),
    readPublishedDocument<OrderingDocument>(orderingDocumentKey("SERVICES")),
  ]);
  return inOrder(services, order);
}

/** The published service at a web address, or where it moved to (plan §8). */
export function findPublishedService(slug: string) {
  return findPublishedRecord<ServiceDocument>("SERVICES", slug);
}

/**
 * A service's page (plan §6.4), published copies only, in two round trips:
 * the service (or where it moved to), every service for the others on its
 * line, and the site's numbers together; then its photo.
 */
export async function getPublishedServicePage(slug: string): Promise<
  | {
      service: PublishedService;
      related: PublishedService[];
      site: SiteDocument | null;
      image: SiteImage | null;
    }
  | { movedTo: string }
  | null
> {
  const [found, services, site] = await Promise.all([
    findPublishedService(slug),
    listPublishedServices(),
    getPublishedSite(),
  ]);
  if (!found || "movedTo" in found) return found;
  const { record: service } = found;
  const photo = service.published.image?.mediaId;
  const image = photo ? ((await getImages([photo])).get(photo) ?? null) : null;
  const related = services.filter(
    (other) => other.id !== service.id && other.published.audience === service.published.audience,
  );
  return { service, related, site, image };
}

/** A service page's title and description (plan §19): the admin's SEO words, or the service's own. */
export async function getServiceMetadata(slug: string): Promise<Metadata> {
  const found = await findPublishedService(slug);
  if (!found || "movedTo" in found) return {};
  const { seo, name, summary, slug: current } = found.record.published;
  const title = seo.title.en ?? name.en;
  const description = seo.description.en ?? summary.en;
  const url = ROUTES.service(current);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: UI_TEXT.siteName },
  };
}

/** A service's share picture (plan §19): its name on its line's sign; the services' own for an address it does not have. */
export async function getServiceShareImage(slug: string) {
  const found = await findPublishedService(slug);
  if (!found || "movedTo" in found) return renderShareImage({ title: PAGE_NAMES.SERVICES });
  const { name, audience } = found.record.published;
  return renderShareImage({ title: name.en, tone: audience === "FAMILIES" ? "sky" : "deep" });
}
