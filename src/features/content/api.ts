import type { Metadata } from "next";
import { cache } from "react";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { PAGE_ROUTES, ROUTES } from "@/constants/routes";
import {
  PAGE_KEYS,
  pageDocumentKey,
  pageFromSlug,
  PAGE_RULES,
  type PageKey,
  type SectionType,
} from "@/constants/sections";
import { listPublishedJobs } from "@/features/careers/api";
import { listPublishedClients } from "@/features/clients/api";
import { assertImagesKept, getImages } from "@/features/media/api";
import { listPublishedServices } from "@/features/services/api";
import { getPublishedSite } from "@/features/settings/api";
import type { Actor } from "@/lib/content/actor";
import { publishedTags, revalidateContent } from "@/lib/content/cache";
import {
  discardDocumentDraft,
  listDocumentStates,
  publishDocument,
  readDocument,
  readDocumentDraft,
  saveDocumentDraft,
} from "@/lib/content/documents";
import { mediaIds } from "@/lib/content/media-ids";
import type { ContentView } from "@/lib/content/view";
import { notFoundError } from "@/lib/errors";
import { renderShareImage } from "@/lib/seo/share-image";
import { type PageDocument, pageDocumentSchema } from "@/lib/validation";

import type { SectionData } from "./types";

/**
 * A page as the public sees it (plan §6, §7): the published copy only, with
 * its hidden sections left out; a page never published is null. In the
 * admin's preview, the draft (§14).
 */
export const getPublishedPage = cache(
  async (page: PageKey, view: ContentView = "published"): Promise<PageDocument | null> => {
    const document = await readDocument<PageDocument>(pageDocumentKey(page), view);
    return document ? { ...document, sections: document.sections.filter((section) => section.visible) } : null;
  },
);

/** Every photo a page's sections name, at any depth: a photo, a slide's (D128). */
const sectionImageIds = (document: PageDocument): string[] => [...mediaIds(document.sections)];

/** The images a page's sections show: its photos, its client logos, and the services' photos where they are shown (D102, D111). */
function imageIds(
  document: PageDocument,
  clients: SectionData["clients"],
  services: SectionData["services"],
): string[] {
  const shows = (type: SectionType) => document.sections.some((section) => section.type === type);
  const logos = shows("CLIENTS") ? clients.map((client) => client.published.logo.mediaId) : [];
  const servicePhotos =
    shows("SERVICES_ROW") || shows("SERVICES_INDEX")
      ? [...mediaIds(services.map((service) => service.published.image))]
      : [];
  return [...sectionImageIds(document), ...logos, ...servicePhotos];
}

/**
 * Everything a page shows, published copies only (plan §7.2, AGENTS.md §13),
 * in two round trips: the page, the site content and the collections its
 * section types may show, together; then the images it refers to.
 */
export async function getPublishedPageContent(
  page: PageKey,
  view: ContentView = "published",
): Promise<{ document: PageDocument; data: SectionData } | null> {
  const may = (...types: SectionType[]) => types.some((type) => PAGE_RULES[page].allowed.includes(type));
  const [document, site, services, jobs, clients] = await Promise.all([
    getPublishedPage(page, view),
    getPublishedSite(view),
    may("SERVICES_INDEX", "FORM", "SERVICES_ROW") ? listPublishedServices(view) : [],
    may("CAREERS_BAND", "JOBS_LIST") ? listPublishedJobs(new Date(), view) : [],
    may("CLIENTS") ? listPublishedClients(view) : [],
  ]);
  if (!document) return null;
  const images = await getImages(imageIds(document, clients, services));
  return { document, data: { site, services, jobs, clients, images } };
}

/** Every public page a search engine should know (plan §19): the fixed pages, each published service, each open job. */
export async function listPublicPaths(): Promise<{ path: string; modified?: Date }[]> {
  const [services, jobs] = await Promise.all([listPublishedServices(), listPublishedJobs()]);
  return [
    ...[
      ROUTES.home,
      ROUTES.about,
      ROUTES.services,
      ROUTES.careers,
      ROUTES.contact,
      ROUTES.quote,
      ROUTES.privacy,
      ROUTES.terms,
    ].map((path) => ({ path })),
    ...services.map((service) => ({ path: ROUTES.service(service.published.slug), modified: service.publishedAt })),
    ...jobs
      .filter((job) => job.open)
      .map((job) => ({ path: ROUTES.job(job.published.slug), modified: job.publishedAt })),
  ];
}

/**
 * A page's title, description and address for search engines and shares
 * (plan §19): the admin's SEO words for the page, else the page's name and the
 * site's description. Home's title is the site's own, whole.
 */
export async function getPageMetadata(page: PageKey): Promise<Metadata> {
  const [document, site] = await Promise.all([getPublishedPage(page), getPublishedSite()]);
  const named = document?.seo.title.en ?? PAGE_NAMES[page];
  const title =
    page === "HOME" && !document?.seo.title.en ? { absolute: site?.seo.title.en ?? UI_TEXT.siteName } : named;
  const description = document?.seo.description.en ?? site?.seo.description.en ?? UI_TEXT.siteDescription;
  const shared = typeof title === "string" ? title : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: PAGE_ROUTES[page] },
    openGraph: { title: shared, description, url: PAGE_ROUTES[page], type: "website", siteName: UI_TEXT.siteName },
  };
}

/**
 * The picture a page shows when it is shared (plan §19): its published sign's
 * headline under the page's name (Home's under none), or its name alone before
 * it is published.
 */
export async function getPageShareImage(page: PageKey) {
  const sign = (await getPublishedPage(page))?.sections[0];
  if (sign?.type !== "SIGN") return renderShareImage({ title: PAGE_NAMES[page] });
  return renderShareImage({ title: sign.content.headline.en, label: page === "HOME" ? undefined : PAGE_NAMES[page] });
}

/** The page an admin address names (D88), or a 404 for one that is not a page. */
export function pageFromParam(slug: string): PageKey {
  const page = pageFromSlug(slug);
  if (!page) throw notFoundError("RECORD_NOT_FOUND");
  return page;
}

/** Where a page stands for the admin (D86): published when, and whether its draft waits to be published. */
export interface PageState {
  page: PageKey;
  publishedAt: Date | null;
  unpublishedChanges: boolean;
}

/** The eight pages for the admin, in the plan's order (plan §7.1), in one query. */
export async function listPagesForAdmin(): Promise<PageState[]> {
  const states = new Map((await listDocumentStates(PAGE_KEYS.map(pageDocumentKey))).map((state) => [state.key, state]));
  return PAGE_KEYS.map((page) => {
    const state = states.get(pageDocumentKey(page));
    return { page, publishedAt: state?.publishedAt ?? null, unpublishedChanges: state?.unpublishedChanges ?? false };
  });
}

/** A page's draft as the admin edits it (plan §14), with where it stands. */
export interface PageDraft extends PageState {
  draft: PageDocument;
}

export async function getPageForAdmin(page: PageKey): Promise<PageDraft> {
  const view = await readDocumentDraft<PageDocument>(pageDocumentKey(page));
  if (!view) throw notFoundError("RECORD_NOT_FOUND");
  return { page, draft: view.draft, publishedAt: view.publishedAt, unpublishedChanges: view.unpublishedChanges };
}

/**
 * Saves a page's draft (plan §14), already held to its page's rules by the
 * route (§7.1), once each photo it names is known to the library; answers the
 * page as saved. The public site is unchanged until Publish.
 */
export async function savePageDraft(page: PageKey, document: PageDocument, actor: Actor): Promise<PageDraft> {
  await assertImagesKept(sectionImageIds(document));
  await saveDocumentDraft(pageDocumentKey(page), document, actor);
  return getPageForAdmin(page);
}

/**
 * Publishes a page's saved draft (plan §14, D86): held to the page's rules
 * once more as it is published, then exactly its cached reads are dropped, so
 * the next visitor sees it.
 */
export async function publishPage(page: PageKey, actor: Actor): Promise<{ publishedAt: Date }> {
  const key = pageDocumentKey(page);
  const publishedAt = await publishDocument(key, actor, (draft) => pageDocumentSchema(page).parse(draft));
  revalidateContent(publishedTags({ document: key }));
  return { publishedAt };
}

/** Throws a page's draft away, back to what is published (plan §14); answers the page as it is again. */
export async function discardPageDraft(page: PageKey, actor: Actor): Promise<PageDraft> {
  await discardDocumentDraft(pageDocumentKey(page), actor);
  return getPageForAdmin(page);
}
