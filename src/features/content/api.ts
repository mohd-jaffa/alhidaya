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
export async function getPublishedPage(page: PageKey): Promise<PageDocument | null> {
  const document = await readPublishedDocument<PageDocument>(pageDocumentKey(page));
  return document ? { ...document, sections: document.sections.filter((section) => section.visible) } : null;
}

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
