import type { Metadata } from "next";
import { cache } from "react";

import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { PAGE_ROUTES, ROUTES } from "@/constants/routes";
import { pageDocumentKey, PAGE_RULES, type PageKey, type SectionType } from "@/constants/sections";
import { listPublishedJobs } from "@/features/careers/api";
import { listPublishedClients } from "@/features/clients/api";
import { getImages } from "@/features/media/api";
import { listPublishedServices } from "@/features/services/api";
import { getPublishedSite } from "@/features/settings/api";
import { readPublishedDocument } from "@/lib/content/documents";
import type { PageDocument } from "@/lib/validation";

import type { SectionData } from "./types";

/**
 * A page as the public sees it (plan §6, §7): the published copy only, with
 * its hidden sections left out; a page never published is null.
 */
export const getPublishedPage = cache(async (page: PageKey): Promise<PageDocument | null> => {
  const document = await readPublishedDocument<PageDocument>(pageDocumentKey(page));
  return document ? { ...document, sections: document.sections.filter((section) => section.visible) } : null;
});

/** The images a page's sections show: its photos and its client logos. */
function imageIds(document: PageDocument, clients: SectionData["clients"]): string[] {
  const ids: string[] = [];
  for (const section of document.sections) {
    if ("image" in section.content && section.content.image) ids.push(section.content.image.mediaId);
    if (section.type === "CLIENTS") ids.push(...clients.map((client) => client.published.logo.mediaId));
  }
  return ids;
}

/**
 * Everything a page shows, published copies only (plan §7.2, AGENTS.md §13),
 * in two round trips: the page, the site content and the collections its
 * section types may show, together; then the images it refers to.
 */
export async function getPublishedPageContent(
  page: PageKey,
): Promise<{ document: PageDocument; data: SectionData } | null> {
  const may = (...types: SectionType[]) => types.some((type) => PAGE_RULES[page].allowed.includes(type));
  const [document, site, services, jobs, clients] = await Promise.all([
    getPublishedPage(page),
    getPublishedSite(),
    may("SERVICES_INDEX") ? listPublishedServices() : [],
    may("CAREERS_BAND", "JOBS_LIST") ? listPublishedJobs() : [],
    may("CLIENTS") ? listPublishedClients() : [],
  ]);
  if (!document) return null;
  const images = await getImages(imageIds(document, clients));
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
