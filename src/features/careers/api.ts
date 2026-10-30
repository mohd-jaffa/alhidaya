import { and, eq, isNotNull, isNull } from "drizzle-orm";
import type { Metadata } from "next";

import { FORM_RATE_LIMIT, TEXT_LIMITS } from "@/constants/limits";
import { PAGE_NAMES, UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import {
  type CvStatus,
  DATAFLOW_LABELS,
  MOPH_LICENCE_LABELS,
  PROMETRIC_LABELS,
  WHERE_NOW_LABELS,
} from "@/constants/statuses";
import { CV_TYPES, type FileType } from "@/constants/uploads";
import { getDb } from "@/db/client";
import { applications, records, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { captureError } from "@/lib/audit/errorLog";
import { displayPhone } from "@/lib/contact";
import { findPublishedRecord, findRecord, listRecords, type PublishedRecord } from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import { dohaDay } from "@/lib/dates";
import { businessRuleError, rateLimitError, validationError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";
import { renderShareImage } from "@/lib/seo/share-image";
import { saveCv } from "@/lib/storage/cvs";
import { detectFileType } from "@/lib/storage/file-type";
import { normaliseLine } from "@/lib/text/normalise";
import type { ApplicationFormPayload, JobDocument } from "@/lib/validation";

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
 * The job an application page is for (plan §9.3): the job at its address
 * (or where it moved to), open or not; in the admin's preview, the draft.
 */
export async function findJobToApply(
  slug: string,
  view: ContentView = "published",
  at: Date = new Date(),
): Promise<PublishedJob | { movedTo: string } | null> {
  const found = await findRecord<JobDocument>("JOBS", slug, view);
  if (!found || "movedTo" in found) return found;
  return withOpen(found.record, dohaDay(at));
}

/**
 * An application page's title and description (plan §19): for a job, its
 * title, while it is open; without one, the general application's.
 */
export async function getApplyMetadata(slug: string | null, at: Date = new Date()): Promise<Metadata> {
  let title: string = UI_TEXT.generalApplicationHeadline;
  let description: string = UI_TEXT.generalApplicationLede;
  let url: string = ROUTES.applyGeneral;
  if (slug !== null) {
    const found = await findPublishedJob(slug, at);
    if (!found || "movedTo" in found || !found.record.open) return {};
    title = UI_TEXT.applyFor(found.record.published.title.en);
    description = UI_TEXT.applyLede;
    url = ROUTES.applyForJob(found.record.published.slug);
  }
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: UI_TEXT.siteName },
  };
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

/** The general application's share picture (plan §19, Q7): its headline on the nurses' leaf-green sign. */
export function getGeneralApplicationShareImage() {
  return renderShareImage({ title: UI_TEXT.generalApplicationHeadline, tone: "leaf" });
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

/**
 * Every answer as the applicant saw and gave it (plan §9.3): each field's
 * label, and a choice's words rather than its code, so the inbox and the HR
 * email read the application as it was sent whatever the form says later.
 * A left-out note is left out.
 */
export function applicationFields(payload: ApplicationFormPayload): SubmittedField[] {
  const answers: [string, string | null][] = [
    [UI_TEXT.fullName, payload.name],
    [UI_TEXT.email, payload.email],
    [UI_TEXT.phone, displayPhone(payload.phone)],
    [UI_TEXT.whereNow, WHERE_NOW_LABELS[payload.whereNow]],
    [UI_TEXT.mophLicence, MOPH_LICENCE_LABELS[payload.mophLicence]],
    [UI_TEXT.dataflow, DATAFLOW_LABELS[payload.dataflow]],
    [UI_TEXT.prometric, PROMETRIC_LABELS[payload.prometric]],
    [UI_TEXT.experienceYears, String(payload.experienceYears)],
    [UI_TEXT.applicationNote, payload.note],
    [UI_TEXT.consent, UI_TEXT.consentGiven],
  ];
  return answers.flatMap(([label, value]) => (value === null ? [] : [{ label, value }]));
}

/** A CV's name as uploaded, kept only to be shown and attached: tidied, bounded, never a path. */
const uploadedName = (name: string) =>
  normaliseLine(name.replace(/^.*[\\/]/, "")).slice(0, TEXT_LIMITS.fileName) || "cv";

/**
 * An application as the route received it (plan §9.3): the CV must be a PDF
 * or Word file by its first bytes; then the row is stored (steps 1 – 2) and
 * the CV saved in the private CV folder (step 3). A CV that cannot be saved
 * leaves the application stored with its CV marked not stored, the failure
 * logged by the application's id alone; the applicant is never told.
 */
export async function receiveApplication(
  payload: ApplicationFormPayload,
  visitorIp: string,
  at: Date = new Date(),
): Promise<{ id: string; cvStatus: CvStatus }> {
  const bytes = new Uint8Array(await payload.cv.arrayBuffer());
  const type = detectFileType(bytes);
  if (type === null || !CV_TYPES.includes(type)) {
    throw validationError("VALIDATION_ERROR", [{ path: "cv", message: VALIDATION_MESSAGES.cvType }]);
  }
  const { jobId, name, email, phone } = payload;
  const { id, jobTitle } = await submitApplication(
    {
      jobId,
      name,
      email,
      phone,
      fields: applicationFields(payload),
      cv: { name: uploadedName(payload.cv.name), type, bytes: bytes.byteLength },
    },
    visitorIp,
    at,
  );

  let cvKey: string | null = null;
  let cvStatus: CvStatus = "STORED";
  try {
    cvKey = await saveCv({ bytes, type, jobTitle, applicantName: name, receivedAt: at });
  } catch (error) {
    cvStatus = "NOT_STORED";
    await captureError({ message: "Application CV not stored", error, context: { applicationId: id } });
  }
  await getDb().update(applications).set({ cvKey, cvStatus, updatedAt: new Date() }).where(eq(applications.id, id));
  return { id, cvStatus };
}
