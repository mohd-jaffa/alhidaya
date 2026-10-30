import type { Metadata } from "next";

import type { Audience } from "@/constants/statuses";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { orderingDocumentKey } from "@/constants/sections";
import { assertImagesKept, getImages } from "@/features/media/api";
import type { SiteImage } from "@/features/media/types";
import { getPublishedSite } from "@/features/settings/api";
import type { Actor } from "@/lib/content/actor";
import { publishedTags, revalidateContent } from "@/lib/content/cache";
import {
  discardDocumentDraft,
  publishDocument,
  readDocument,
  readDocumentDraft,
  saveDocumentDraft,
} from "@/lib/content/documents";
import { inOrder } from "@/lib/content/ordering";
import {
  type AdminRecord,
  createRecord,
  discardRecordDraft,
  findPublishedRecord,
  findRecord,
  getRecordForAdmin,
  listRecords,
  listRecordsForAdmin,
  publishRecord,
  type PublishedRecord,
  saveRecordDraft,
  setRecordArchived,
} from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import { renderShareImage } from "@/lib/seo/share-image";
import {
  type OrderingDocument,
  orderingDocumentSchema,
  type ServiceDocument,
  serviceDocumentSchema,
  type SiteDocument,
} from "@/lib/validation";

export type PublishedService = PublishedRecord<ServiceDocument>;

/** Every published service, in the published order (plan §8, D59). */
export async function listPublishedServices(view: ContentView = "published"): Promise<PublishedService[]> {
  const [services, order] = await Promise.all([
    listRecords<ServiceDocument>("SERVICES", view),
    readDocument<OrderingDocument>(orderingDocumentKey("SERVICES"), view),
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
export async function getPublishedServicePage(
  slug: string,
  view: ContentView = "published",
): Promise<
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
    findRecord<ServiceDocument>("SERVICES", slug, view),
    listPublishedServices(view),
    getPublishedSite(view),
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

/** A service in the admin's list (D92): what its row says, and where it stands. */
export interface ServiceSummary {
  id: string;
  name: string;
  /** The address its draft gives it. */
  slug: string;
  audience: Audience;
  publishedAt: Date | null;
  archivedAt: Date | null;
  unpublishedChanges: boolean;
}

/** The services in the order their draft order gives (archived last), and where that order stands (D92). */
export interface ServiceList {
  items: ServiceSummary[];
  order: { publishedAt: Date | null; unpublishedChanges: boolean };
}

/** A service opened in the editor (D92), as its draft reads. */
export interface ServiceDraft {
  id: string;
  draft: ServiceDocument;
  publishedAt: Date | null;
  archivedAt: Date | null;
  unpublishedChanges: boolean;
}

const ORDER_KEY = orderingDocumentKey("SERVICES");

const asDraft = (record: AdminRecord<ServiceDocument>): ServiceDraft => ({
  id: record.id,
  draft: record.draft,
  publishedAt: record.publishedAt,
  archivedAt: record.archivedAt,
  unpublishedChanges: record.unpublishedChanges,
});

/** Every service for the admin (D92), in two round trips' worth of reads made together. */
export async function listServicesForAdmin(): Promise<ServiceList> {
  const [records, order] = await Promise.all([
    listRecordsForAdmin<ServiceDocument>("SERVICES"),
    readDocumentDraft<OrderingDocument>(ORDER_KEY),
  ]);
  // A service not in the order yet goes after those it names, as on the site (D59).
  const items = inOrder(
    records.map((record) => ({ record, id: record.id, publishedAt: record.publishedAt ?? record.updatedAt })),
    order?.draft ?? null,
  ).map(({ record }) => ({
    id: record.id,
    name: record.draft.name.en,
    slug: record.draft.slug,
    audience: record.draft.audience,
    publishedAt: record.publishedAt,
    archivedAt: record.archivedAt,
    unpublishedChanges: record.unpublishedChanges,
  }));
  return {
    items: [...items.filter((item) => !item.archivedAt), ...items.filter((item) => item.archivedAt)],
    order: { publishedAt: order?.publishedAt ?? null, unpublishedChanges: order?.unpublishedChanges ?? false },
  };
}

export async function getServiceForAdmin(id: string): Promise<ServiceDraft> {
  return asDraft(await getRecordForAdmin<ServiceDocument>("SERVICES", id));
}

/** Makes a service as a draft (D92), its photo known to the library; nothing shows on the site until it is published. */
export async function createService(document: ServiceDocument, actor: Actor): Promise<ServiceDraft> {
  await assertImagesKept(document.image ? [document.image.mediaId] : []);
  return getServiceForAdmin(await createRecord("SERVICES", document, actor));
}

/** Saves a service's draft (plan §14); the site is unchanged until Publish. */
export async function saveServiceDraft(id: string, document: ServiceDocument, actor: Actor): Promise<ServiceDraft> {
  await assertImagesKept(document.image ? [document.image.mediaId] : []);
  await saveRecordDraft("SERVICES", id, document, actor);
  return getServiceForAdmin(id);
}

/**
 * Publishes a service's saved draft (plan §14, §8): checked once more as it
 * is published, at the address it gives; an address it had before keeps
 * answering with a redirect. Then exactly what shows it is read afresh.
 */
export async function publishService(id: string, actor: Actor): Promise<ServiceDraft> {
  const before = await getRecordForAdmin<ServiceDocument>("SERVICES", id);
  await publishRecord("SERVICES", id, (draft) => serviceDocumentSchema.parse(draft).slug, actor);
  const after = await getServiceForAdmin(id);
  revalidateContent(publishedTags({ collection: "SERVICES", slugs: [before.slug, after.draft.slug] }));
  return after;
}

/** Throws a service's draft away, back to what is published (plan §14). */
export async function discardServiceDraft(id: string, actor: Actor): Promise<ServiceDraft> {
  await discardRecordDraft("SERVICES", id, actor);
  return getServiceForAdmin(id);
}

/** Takes a service off the site, or puts it back (D92); it is never deleted. */
export async function setServiceArchived(id: string, archived: boolean, actor: Actor): Promise<ServiceDraft> {
  const record = await getRecordForAdmin<ServiceDocument>("SERVICES", id);
  await setRecordArchived("SERVICES", id, archived, actor);
  revalidateContent(publishedTags({ collection: "SERVICES", slugs: [record.slug] }));
  return getServiceForAdmin(id);
}

/** Saves the services' order as a draft (D92): the ids of the services, those not archived, as the admin set them. */
export async function saveServiceOrder(ids: OrderingDocument, actor: Actor): Promise<ServiceList> {
  const known = new Set((await listRecordsForAdmin("SERVICES")).map((record) => record.id));
  await saveDocumentDraft(
    ORDER_KEY,
    ids.filter((id) => known.has(id)),
    actor,
  );
  return listServicesForAdmin();
}

/** Publishes the services' order (D92): every list of services on the site follows it. */
export async function publishServiceOrder(actor: Actor): Promise<ServiceList> {
  await publishDocument(ORDER_KEY, actor, (draft) => orderingDocumentSchema.parse(draft));
  revalidateContent(publishedTags({ document: ORDER_KEY }));
  return listServicesForAdmin();
}

/** Throws the order's draft away, back to the published order. */
export async function discardServiceOrder(actor: Actor): Promise<ServiceList> {
  await discardDocumentDraft(ORDER_KEY, actor);
  return listServicesForAdmin();
}
