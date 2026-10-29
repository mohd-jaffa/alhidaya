import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { Metadata } from "next";

import { FORM_RATE_LIMIT } from "@/constants/limits";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { FileType } from "@/constants/uploads";
import { getDb } from "@/db/client";
import { applications, records, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { findPublishedRecord, findRecord, listRecords, type PublishedRecord } from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import { dohaDay } from "@/lib/dates";
import { businessRuleError, rateLimitError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";
import { renderShareImage } from "@/lib/seo/share-image";
import type { JobDocument } from "@/lib/validation";

export interface PublishedJob extends PublishedRecord<JobDocument> {
  /** Open until the end of its closing day in Doha; with no closing date, open (plan §9.1). */
  open: boolean;
}

const isOpen = (job: JobDocument, today: string) => job.closesOn === null || job.closesOn >= today;

const withOpen = (job: PublishedRecord<JobDocument>, today: string): PublishedJob => ({
  ...job,
  open: isOpen(job.published, today),
});

/** Every published job, open ones first, newest posting first (plan §6.5). */
export async function listPublishedJobs(
  at: Date = new Date(),
  view: ContentView = "published",
): Promise<PublishedJob[]> {
  const today = dohaDay(at);
  const jobs = (await listRecords<JobDocument>("JOBS", view)).map((job) => withOpen(job, today));
  return jobs.sort(
    (a, b) => Number(b.open) - Number(a.open) || b.published.postedOn.localeCompare(a.published.postedOn),
  );
}

/** The published job at a web address (closed ones too, which say so), or where it moved to. */
export async function findPublishedJob(slug: string, at: Date = new Date()) {
  const found = await findPublishedRecord<JobDocument>("JOBS", slug);
  return found && "record" in found ? { record: withOpen(found.record, dohaDay(at)) } : found;
}

/**
 * A job's page (plan §6.6) in one round trip: the job at its address (or
 * where it moved to), with the other open jobs a closed one offers instead.
 * In the admin's preview, the drafts.
 */
export async function getPublishedJobPage(
  slug: string,
  view: ContentView = "published",
  at: Date = new Date(),
): Promise<{ job: PublishedJob; others: PublishedJob[] } | { movedTo: string } | null> {
  const [found, jobs] = await Promise.all([findRecord<JobDocument>("JOBS", slug, view), listPublishedJobs(at, view)]);
  if (!found || "movedTo" in found) return found;
  const job = withOpen(found.record, dohaDay(at));
  return { job, others: jobs.filter((other) => other.open && other.id !== job.id) };
}

/**
 * A job page's title and description (plan §19): the admin's SEO words, or
 * the job's own. A closed job stays for anyone who has its address, but is
 * kept out of search.
 */
export async function getJobMetadata(slug: string, at: Date = new Date()): Promise<Metadata> {
  const found = await findPublishedJob(slug, at);
  if (!found || "movedTo" in found) return {};
  const { open, published } = found.record;
  const title = published.seo.title.en ?? published.title.en;
  const description = published.seo.description.en ?? published.summary.en;
  const url = ROUTES.job(published.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: UI_TEXT.siteName },
    ...(open ? {} : { robots: { index: false } }),
  };
}

/** A job's share picture (plan §19): its title on the nurses' leaf-green sign; Careers' own for an address it does not have. */
export async function getJobShareImage(slug: string) {
  const found = await findPublishedJob(slug);
  return renderShareImage({
    title: found && "record" in found ? found.record.published.title.en : PAGE_NAMES.CAREERS,
    tone: "leaf",
  });
}

/**
 * An application, parsed by the form's schema and labelled as the applicant
 * saw it, with what is known of the CV before it is saved (plan §9.2): its
 * name as uploaded, its type from its first bytes, its size.
 */
export interface ApplicationSubmission {
  /** The job applied for; null for a general application (plan Q7). */
  jobId: string | null;
  name: string;
  email: string;
  phone: string;
  fields: SubmittedField[];
  cv: { name: string; type: FileType; bytes: number };
}

/**
 * Stores an application (plan §9.3, steps 1 – 2) in one transaction with its
 * rate limit: past the limit nothing is stored, and neither is an application
 * to a job that is not published and open in Doha today (plan §6.6). The
 * job's title is taken from the published job, as applied for. Answers the
 * application's id and that title; the CV is saved and the HR email sent
 * after it (R5.4).
 */
export async function submitApplication(
  submission: ApplicationSubmission,
  visitorIp: string,
  at: Date = new Date(),
): Promise<{ id: string; jobTitle: string | null }> {
  const id = newId();
  const { cv, ...applicant } = submission;
  const jobTitle = await getDb().transaction(async (tx) => {
    if (!(await consumeRateLimit({ scope: "application", key: visitorIp, ...FORM_RATE_LIMIT }, at, tx)))
      throw rateLimitError("RATE_LIMITED");

    let title: string | null = null;
    if (submission.jobId !== null) {
      const [job] = await tx
        .select({ published: records.published })
        .from(records)
        .where(
          and(
            eq(records.id, submission.jobId),
            eq(records.collection, "JOBS"),
            isNotNull(records.published),
            isNull(records.archivedAt),
          ),
        );
      const published = job?.published as JobDocument | undefined;
      if (!published || !isOpen(published, dohaDay(at))) throw businessRuleError("JOB_CLOSED");
      title = published.title.en;
    }

    await tx.insert(applications).values({
      id,
      ...applicant,
      jobTitle: title,
      cvName: cv.name,
      cvType: cv.type,
      cvBytes: cv.bytes,
      createdAt: at,
      updatedAt: at,
    });
    return title;
  });
  return { id, jobTitle };
}
