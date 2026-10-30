import { cache } from "react";

import { SITE_DOCUMENT_KEY } from "@/constants/sections";
import { deleteOtherPdfs, getPdfFile, type PdfFile, publishedPdfUrl, storeBrochure } from "@/features/media/api";
import type { Actor } from "@/lib/content/actor";
import { publishedTags, revalidateContent } from "@/lib/content/cache";
import {
  discardDocumentDraft,
  publishDocument,
  readDocument,
  readDocumentDraft,
  readPublishedDocument,
  saveDocumentDraft,
} from "@/lib/content/documents";
import type { ContentView } from "@/lib/content/view";
import { notFoundError } from "@/lib/errors";
import { type SiteDocument, siteDocumentSchema } from "@/lib/validation";

/**
 * The site's published content (plan §13): contact details, links, SEO
 * defaults, the brochure; the draft in the admin's preview. Read once a request.
 */
export const getPublishedSite = cache((view: ContentView = "published"): Promise<SiteDocument | null> =>
  readDocument<SiteDocument>(SITE_DOCUMENT_KEY, view),
);

/** The published brochure's file (plan §12): where `/brochure` sends a visitor, or null when there is none. */
export async function getBrochureUrl(): Promise<string | null> {
  const brochure = (await readPublishedDocument<SiteDocument>(SITE_DOCUMENT_KEY))?.brochure;
  return brochure ? publishedPdfUrl(brochure.mediaId) : null;
}

/** The site's content as the Settings editor opens it (D94), with its brochure's file to show. */
export interface SiteDraft {
  draft: SiteDocument;
  publishedAt: Date | null;
  unpublishedChanges: boolean;
  brochure: PdfFile | null;
}

export async function getSiteForAdmin(): Promise<SiteDraft> {
  const view = await readDocumentDraft<SiteDocument>(SITE_DOCUMENT_KEY);
  if (!view) throw notFoundError("RECORD_NOT_FOUND");
  return {
    draft: view.draft,
    publishedAt: view.publishedAt,
    unpublishedChanges: view.unpublishedChanges,
    brochure: view.draft.brochure ? await getPdfFile(view.draft.brochure.mediaId) : null,
  };
}

/** Saves the site's content as a draft (plan §13), its brochure a PDF the library holds; the site is unchanged until Publish. */
export async function saveSiteDraft(document: SiteDocument, actor: Actor): Promise<SiteDraft> {
  if (document.brochure && !(await getPdfFile(document.brochure.mediaId))) throw notFoundError("RECORD_NOT_FOUND");
  await saveDocumentDraft(SITE_DOCUMENT_KEY, document, actor);
  return getSiteForAdmin();
}

/**
 * Publishes the site's content (plan §13, §14, D94): checked as it goes live,
 * then every page reads it afresh, and `/brochure` opens the new brochure. A
 * brochure neither copy names any more is deleted, its room given back.
 */
export async function publishSite(actor: Actor): Promise<SiteDraft> {
  await publishDocument(SITE_DOCUMENT_KEY, actor, (draft) => siteDocumentSchema.parse(draft));
  revalidateContent(publishedTags({ document: SITE_DOCUMENT_KEY }));
  const site = await getSiteForAdmin();
  await deleteOtherPdfs(site.draft.brochure ? [site.draft.brochure.mediaId] : [], actor);
  return site;
}

/** Throws the site's draft away, back to what is published (plan §14). */
export async function discardSiteDraft(actor: Actor): Promise<SiteDraft> {
  await discardDocumentDraft(SITE_DOCUMENT_KEY, actor);
  return getSiteForAdmin();
}

/** Uploads a new brochure (D94): kept, but on the website only once Settings is published with it. */
export function uploadBrochure(bytes: Uint8Array, actor: Actor): Promise<PdfFile> {
  return storeBrochure(bytes, actor);
}
