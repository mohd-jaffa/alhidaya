import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { FORM_RATE_LIMIT } from "@/constants/limits";
import type { FileType } from "@/constants/uploads";
import { getDb } from "@/db/client";
import { applications, records, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { findPublishedRecord, listRecords, type PublishedRecord } from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import { dohaDay } from "@/lib/dates";
import { businessRuleError, rateLimitError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";
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
