import { findPublishedRecord, listPublishedRecords, type PublishedRecord } from "@/lib/content/records";
import { dohaDay } from "@/lib/dates";
import type { JobDocument } from "@/lib/validation";

export interface PublishedJob extends PublishedRecord<JobDocument> {
  /** Open until the end of its closing day in Doha; with no closing date, open (plan §9.1). */
  open: boolean;
}

const withOpen = (job: PublishedRecord<JobDocument>, today: string): PublishedJob => ({
  ...job,
  open: job.published.closesOn === null || job.published.closesOn >= today,
});

/** Every published job, open ones first, newest posting first (plan §6.5). */
export async function listPublishedJobs(at: Date = new Date()): Promise<PublishedJob[]> {
  const today = dohaDay(at);
  const jobs = (await listPublishedRecords<JobDocument>("JOBS")).map((job) => withOpen(job, today));
  return jobs.sort(
    (a, b) => Number(b.open) - Number(a.open) || b.published.postedOn.localeCompare(a.published.postedOn),
  );
}

/** The published job at a web address (closed ones too, which say so), or where it moved to. */
export async function findPublishedJob(slug: string, at: Date = new Date()) {
  const found = await findPublishedRecord<JobDocument>("JOBS", slug);
  return found && "record" in found ? { record: withOpen(found.record, dohaDay(at)) } : found;
}
