import { and, desc, eq, gte, isNotNull, lt } from "drizzle-orm";
import { cache } from "react";

import { DISK_BUDGETS } from "@/constants/limits";
import { SITE_DOCUMENT_KEY } from "@/constants/sections";
import { AUDIT_ENTITIES } from "@/constants/statuses";
import { getDb } from "@/db/client";
import { applications, auditLog, enquiries, rateLimits } from "@/db/schema";
import { deleteOtherPdfs, getPdfFile, type PdfFile, publishedPdfUrl, storeBrochure } from "@/features/media/api";
import { logActionSafe } from "@/lib/audit/auditLog";
import { captureError } from "@/lib/audit/errorLog";
import { cleanUpLogs } from "@/lib/audit/retention";
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
import { getOperations, updateOperations } from "@/lib/content/operations";
import type { ContentView } from "@/lib/content/view";
import { notFoundError } from "@/lib/errors";
import { cvFolderBytes, deleteCv } from "@/lib/storage/cvs";
import { mediaFolderBytes } from "@/lib/storage/media";
import { type OperationsPayload, type SiteDocument, siteDocumentSchema } from "@/lib/validation";

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

const DAY_MS = 24 * 60 * 60 * 1000;

/** What a daily clean-up did (plan §18): how many of each went, and the CV files it could not delete. */
export interface PurgeResult {
  enquiries: number;
  applications: number;
  cvs: number;
  filesNotDeleted: number;
}

/** Deletes a CV file, or says it could not, for the next day's run to try again (plan §18). */
async function deletedCv(key: string, id: string): Promise<boolean> {
  try {
    await deleteCv(key);
    return true;
  } catch (error) {
    await captureError({ message: "CV file not deleted by the clean-up", error, reference: id });
    return false;
  }
}

/**
 * The daily clean-up (plan §18, D24, D52), run by the cPanel cron entry:
 * enquiries and applications older than the retention period go, with their
 * notes and CV files; CV files older than the CV expiry go, their
 * applications kept and marked expired. A CV file that will not go keeps its
 * application as it is, so the next day's run tries again, and is counted.
 * Old rate-limit windows and log rows go too. Recorded, as counts only, in
 * the audit trail, where Operations shows the last run.
 */
export async function purgeExpired(at: Date = new Date()): Promise<PurgeResult> {
  const db = getDb();
  const { retentionDays, cvExpiryDays } = await getOperations();
  const retained = new Date(at.getTime() - retentionDays * DAY_MS);
  const expired = new Date(at.getTime() - cvExpiryDays * DAY_MS);
  const result: PurgeResult = { enquiries: 0, applications: 0, cvs: 0, filesNotDeleted: 0 };

  const [goneEnquiries] = await db.delete(enquiries).where(lt(enquiries.createdAt, retained));
  result.enquiries = goneEnquiries.affectedRows;

  const old = await db
    .select({ id: applications.id, cvKey: applications.cvKey })
    .from(applications)
    .where(lt(applications.createdAt, retained));
  for (const application of old) {
    if (application.cvKey && !(await deletedCv(application.cvKey, application.id))) {
      result.filesNotDeleted += 1;
      continue;
    }
    await db.delete(applications).where(eq(applications.id, application.id));
    result.applications += 1;
  }

  const stale = await db
    .select({ id: applications.id, cvKey: applications.cvKey })
    .from(applications)
    // Those past retention were the first pass's; one it could not clear waits for tomorrow, counted once.
    .where(
      and(lt(applications.createdAt, expired), gte(applications.createdAt, retained), isNotNull(applications.cvKey)),
    );
  for (const application of stale) {
    if (!(await deletedCv(application.cvKey!, application.id))) {
      result.filesNotDeleted += 1;
      continue;
    }
    await db.update(applications).set({ cvKey: null, cvStatus: "EXPIRED" }).where(eq(applications.id, application.id));
    result.cvs += 1;
  }

  await db.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(at.getTime() - DAY_MS)));
  await cleanUpLogs(at);
  await logActionSafe({
    actorId: null,
    action: "RETENTION_PURGE",
    entityType: AUDIT_ENTITIES.operations,
    entityId: null,
    changes: { ...result },
    requestId: null,
  });
  return result;
}

/** How full each upload folder is against its budget (plan §21.2, D95). */
export interface DiskUse {
  bytes: number;
  budget: number;
}

/** How the site runs, as Operations shows it (D95): the settings, the folders' use and the last clean-up. */
export interface OperationsView {
  operations: OperationsPayload;
  disk: { media: DiskUse; cvs: DiskUse };
  lastPurge: (PurgeResult & { at: Date }) | null;
}

export async function getOperationsForAdmin(): Promise<OperationsView> {
  const [operations, media, cvs, [last]] = await Promise.all([
    getOperations(),
    mediaFolderBytes(),
    cvFolderBytes(),
    getDb()
      .select({ at: auditLog.createdAt, changes: auditLog.changes })
      .from(auditLog)
      .where(eq(auditLog.action, "RETENTION_PURGE"))
      .orderBy(desc(auditLog.createdAt))
      .limit(1),
  ]);
  return {
    operations,
    disk: {
      media: { bytes: media, budget: DISK_BUDGETS.mediaBytes },
      cvs: { bytes: cvs, budget: DISK_BUDGETS.cvBytes },
    },
    lastPurge: last ? { ...(last.changes as PurgeResult), at: last.at } : null,
  };
}

/** Changes how the site runs (plan §13): at once, and audited with what changed. */
export async function saveOperations(next: OperationsPayload, actor: Actor): Promise<OperationsView> {
  await updateOperations(next, actor);
  return getOperationsForAdmin();
}
