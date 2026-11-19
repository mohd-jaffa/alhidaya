import { plainText } from "@/lib/text/inline";
import { and, asc, count, desc, eq, inArray, isNotNull, isNull, max } from "drizzle-orm";
import type { Metadata } from "next";

import { CV_SAVE_RETRIES, FORM_RATE_LIMIT, INBOX_PAGE_SIZE, TEXT_LIMITS } from "@/constants/limits";
import { ERROR_MESSAGES, PAGE_NAMES, UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import {
  APPLICATION_SCREENING_FIELDS,
  type ApplicationScreeningField,
  AUDIT_ENTITIES,
  type ApplicationStatus,
  type CvStatus,
  DATAFLOW_LABELS,
  type EmailStatus,
  type EmploymentType,
  type JobQuestionSelection,
  MOPH_LICENCE_LABELS,
  PROMETRIC_LABELS,
  WHERE_NOW_LABELS,
} from "@/constants/statuses";
import { CV_TYPES, FILE_TYPES, type FileType } from "@/constants/uploads";
import { getDb } from "@/db/client";
import { applicationNotes, applications, authUser, records, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { logActionSafe } from "@/lib/audit/auditLog";
import { captureError } from "@/lib/audit/errorLog";
import { needsAttention } from "@/lib/inbox/arrivals";
import { type RetryRun, retryUnsentMail } from "@/lib/inbox/mail-retry";
import { displayPhone } from "@/lib/contact";
import type { Actor } from "@/lib/content/actor";
import { publishedTags, revalidateContent } from "@/lib/content/cache";
import { getOperations } from "@/lib/content/operations";
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
  setRecordClosed,
} from "@/lib/content/records";
import type { ContentView } from "@/lib/content/view";
import { dohaDay } from "@/lib/dates";
import {
  businessRuleError,
  conflictError,
  fromDatabaseError,
  internalError,
  isAppError,
  notFoundError,
  rateLimitError,
  referencesMissingRow,
  validationError,
} from "@/lib/errors";
import { createConfiguredMailService } from "@/lib/mail/nodemailer.provider";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";
import { renderShareImage } from "@/lib/seo/share-image";
import { type CvToStore, cvKey as newCvKey, deleteCv, readCv, saveCv } from "@/lib/storage/cvs";
import { detectFileType } from "@/lib/storage/file-type";
import { normaliseLine } from "@/lib/text/normalise";
import { matchingPerson } from "@/lib/text/search";
import {
  type ApplicationFormPayload,
  type ApplicationListQueryPayload,
  type ChosenAnswer,
  GENERAL_APPLICATIONS,
  type JobDocument,
  jobDocumentSchema,
} from "@/lib/validation";

export interface PublishedJob extends PublishedRecord<JobDocument> {
  /** Open until the end of its closing day in Doha, or until the admin closes it (plan §9.1, D92). */
  open: boolean;
}

/** One of a job's own questions as an applicant reads it (D209): its words and its choices, plain. */
export interface AskedQuestion {
  question: string;
  choices: string[];
  selection: JobQuestionSelection;
}

const plainLine = (text: string) => normaliseLine(plainText(text));

/**
 * A job's own questions as its application form asks them (D209), in its
 * order, in plain words; none for a job published before there were any.
 */
export const askedQuestions = (job: JobDocument): AskedQuestion[] =>
  (job.questions ?? []).map(({ question, choices, selection = "single" }) => ({
    question: plainLine(question.en),
    choices: choices.map((choice) => plainLine(choice.en)),
    selection,
  }));

const selectedChoices = (answer: ChosenAnswer) => ("choices" in answer ? answer.choices : [answer.choice]);

/**
 * Refuses answers that are not to the job's own questions as published
 * (D209, D210): each needs distinct, allowed choices within its selection
 * mode. The applicant is asked to reload when the submitted answers do not fit.
 */
export function checkAnswers(asked: readonly AskedQuestion[], answers: readonly ChosenAnswer[]): void {
  const answered =
    answers.length === asked.length &&
    asked.every(({ question, choices, selection }) => {
      const answer = answers.find((item) => item.question === question);
      if (!answer) return false;
      const selected = selectedChoices(answer);
      return (
        selected.length > 0 &&
        (selection === "multiple" || selected.length === 1) &&
        new Set(selected).size === selected.length &&
        selected.every((choice) => choices.includes(choice))
      );
    });
  if (!answered) throw conflictError("JOB_QUESTIONS_CHANGED");
}

const isOpen = (job: JobDocument, today: string) => !job.closed && (job.closesOn === null || job.closesOn >= today);

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
    title = UI_TEXT.applyFor(plainText(found.record.published.title.en));
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
  const title = plainText(published.seo.title.en ?? published.title.en);
  const description = plainText(published.seo.description.en ?? published.summary.en);
  const url = ROUTES.job(published.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: UI_TEXT.siteName },
    ...(open ? {} : { robots: { index: false } }),
  };
}

/** A job's share picture (plan §19): its title under Careers; Careers' own for an address it does not have. */
export async function getJobShareImage(slug: string) {
  const found = await findPublishedJob(slug);
  return found && "record" in found
    ? renderShareImage({ title: found.record.published.title.en, label: PAGE_NAMES.CAREERS })
    : renderShareImage({ title: PAGE_NAMES.CAREERS });
}

/** The general application's share picture (plan §19, Q7): its headline under Careers. */
export function getGeneralApplicationShareImage() {
  return renderShareImage({ title: UI_TEXT.generalApplicationHeadline, label: PAGE_NAMES.CAREERS });
}

/** A job in the admin's list (D92): what its row says, and where it stands on the site. */
export interface JobSummary {
  id: string;
  title: string;
  /** The address its draft gives it. */
  slug: string;
  location: string;
  employmentType: EmploymentType;
  postedOn: string;
  closesOn: string | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  unpublishedChanges: boolean;
  /** Whether the site takes applications for it now; never, before it is published. */
  open: boolean;
}

/** A job opened in the editor (D92), as its draft reads, and whether the site takes applications for it. */
export interface JobDraft {
  id: string;
  draft: JobDocument;
  publishedAt: Date | null;
  archivedAt: Date | null;
  unpublishedChanges: boolean;
  open: boolean;
}

const liveOpen = (record: AdminRecord<JobDocument>, today: string) =>
  record.published !== null && isOpen(record.published, today);

const asJobDraft = (record: AdminRecord<JobDocument>, at: Date): JobDraft => ({
  id: record.id,
  draft: record.draft,
  publishedAt: record.publishedAt,
  archivedAt: record.archivedAt,
  unpublishedChanges: record.unpublishedChanges,
  open: liveOpen(record, dohaDay(at)),
});

/** Every job for the admin (D92), newest posting first; the screen groups them by where they stand. */
export async function listJobsForAdmin(at: Date = new Date()): Promise<JobSummary[]> {
  const today = dohaDay(at);
  return (await listRecordsForAdmin<JobDocument>("JOBS"))
    .map((record) => ({
      id: record.id,
      title: plainText(record.draft.title.en),
      slug: record.draft.slug,
      location: record.draft.location.en,
      employmentType: record.draft.employmentType,
      postedOn: record.draft.postedOn,
      closesOn: record.draft.closesOn,
      publishedAt: record.publishedAt,
      archivedAt: record.archivedAt,
      unpublishedChanges: record.unpublishedChanges,
      open: liveOpen(record, today),
    }))
    .sort((a, b) => b.postedOn.localeCompare(a.postedOn));
}

export async function getJobForAdmin(id: string, at: Date = new Date()): Promise<JobDraft> {
  return asJobDraft(await getRecordForAdmin<JobDocument>("JOBS", id), at);
}

/** Makes a job as a draft (D92), open until it is closed; nothing shows on the site until it is published. */
export async function createJob(document: JobDocument, actor: Actor): Promise<JobDraft> {
  return getJobForAdmin(await createRecord("JOBS", { ...document, closed: false }, actor));
}

/**
 * Saves a job's draft (plan §14). Whether it is closed is not the editor's
 * to change: Close now and Reopen set it (D92), so the saved draft keeps it.
 */
export async function saveJobDraft(id: string, document: JobDocument, actor: Actor): Promise<JobDraft> {
  const current = await getRecordForAdmin<JobDocument>("JOBS", id);
  await saveRecordDraft("JOBS", id, { ...document, closed: current.draft.closed ?? false }, actor);
  return getJobForAdmin(id);
}

/** Publishes a job's saved draft (plan §14, §9.1), checked as it goes live; its old address redirects. */
export async function publishJob(id: string, actor: Actor): Promise<JobDraft> {
  const before = await getRecordForAdmin<JobDocument>("JOBS", id);
  await publishRecord("JOBS", id, (draft) => jobDocumentSchema.parse(draft).slug, actor);
  const after = await getJobForAdmin(id);
  revalidateContent(publishedTags({ collection: "JOBS", slugs: [before.slug, after.draft.slug] }));
  return after;
}

/** Throws a job's draft away, back to what is published (plan §14). */
export async function discardJobDraft(id: string, actor: Actor): Promise<JobDraft> {
  await discardRecordDraft("JOBS", id, actor);
  return getJobForAdmin(id);
}

/** Closes a published job at once, or opens it again (D92): it stays at its address, saying so. */
export async function setJobClosed(id: string, closed: boolean, actor: Actor): Promise<JobDraft> {
  await setRecordClosed("JOBS", id, closed, actor);
  const job = await getRecordForAdmin<JobDocument>("JOBS", id);
  revalidateContent(publishedTags({ collection: "JOBS", slugs: [job.slug] }));
  return asJobDraft(job, new Date());
}

/** Takes a job off the site, or puts it back (D92); it and its applications are kept. */
export async function setJobArchived(id: string, archived: boolean, actor: Actor): Promise<JobDraft> {
  const job = await getRecordForAdmin<JobDocument>("JOBS", id);
  await setRecordArchived("JOBS", id, archived, actor);
  revalidateContent(publishedTags({ collection: "JOBS", slugs: [job.slug] }));
  return getJobForAdmin(id);
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
  /** The job's own questions as answered (D209), checked against the published job; none for a general application. */
  answers?: ChosenAnswer[];
  screeningAnswers?: ApplicationScreeningField[];
  /** Parsed experience answer, checked against the job's visibility before anything is stored. */
  experienceYears?: number;
  cv: { name: string; type: FileType; bytes: number };
}

/**
 * Stores an application (plan §9.3, steps 1 – 2) in one transaction with its
 * rate limit: past the limit nothing is stored, and neither is an application
 * to a job that is not published and open in Doha today (plan §6.6), nor one
 * whose answers are not to the job's own questions as published (D209). The
 * job's title is taken from the published job, as applied for. `keepCv`
 * saves the CV inside the same transaction once that title is known (D84):
 * a CV that cannot be saved stores nothing and counts nothing against the
 * limit, and a CV saved for an application that is then not stored is
 * deleted. Answers the application's id and the job's title.
 */
export async function submitApplication(
  submission: ApplicationSubmission,
  visitorIp: string,
  at: Date = new Date(),
  keepCv?: (jobTitle: string | null) => Promise<string>,
): Promise<{ id: string; jobTitle: string | null }> {
  const id = newId();
  const { cv, answers = [], screeningAnswers = [], experienceYears, ...applicant } = submission;
  let kept: string | null = null;
  try {
    return { id, jobTitle: await storeApplication() };
  } catch (error) {
    if (kept) await deleteCv(kept);
    throw error;
  }

  async function storeApplication() {
    return getDb().transaction(async (tx) => {
      if (!(await consumeRateLimit({ scope: "application", key: visitorIp, ...FORM_RATE_LIMIT }, at, tx)))
        throw rateLimitError("RATE_LIMITED");

      let title: string | null = null;
      let asked: AskedQuestion[] = [];
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
        title = plainText(published.title.en);
        asked = askedQuestions(published);
        if (
          published.hiddenQuestions?.some((field) => field !== "experienceYears" && screeningAnswers.includes(field))
        ) {
          throw conflictError("JOB_QUESTIONS_CHANGED");
        }
        const asksExperience = !published.hiddenQuestions?.includes("experienceYears");
        const answeredExperience = experienceYears !== undefined;
        if (asksExperience !== answeredExperience) throw conflictError("JOB_QUESTIONS_CHANGED");
      }
      checkAnswers(asked, answers);

      kept = keepCv ? await keepCv(title) : null;
      await tx.insert(applications).values({
        id,
        ...applicant,
        jobTitle: title,
        cvName: cv.name,
        cvType: cv.type,
        cvBytes: cv.bytes,
        ...(kept ? { cvKey: kept, cvStatus: "STORED" } : {}),
        createdAt: at,
        updatedAt: at,
      });
      return title;
    });
  }
}

const answerLabel = <T extends string>(value: T | undefined, labels: Record<T, string>) =>
  value === undefined ? null : labels[value];

/**
 * Every answer as the applicant saw and gave it (plan §9.3): each field's
 * label, and a choice's words rather than its code, so the inbox and the HR
 * email read the application as it was sent whatever the form says later.
 * The job's own questions (D209) follow the fixed ones, as the form asks them.
 * Skipped screening questions and empty notes are omitted.
 */
export function applicationFields(payload: ApplicationFormPayload): SubmittedField[] {
  const answers: [string, string | null][] = [
    [UI_TEXT.fullName, payload.name],
    [UI_TEXT.email, payload.email],
    [UI_TEXT.phone, displayPhone(payload.phone)],
    [UI_TEXT.whereNow, answerLabel(payload.whereNow, WHERE_NOW_LABELS)],
    [UI_TEXT.mophLicence, answerLabel(payload.mophLicence, MOPH_LICENCE_LABELS)],
    [UI_TEXT.dataflow, answerLabel(payload.dataflow, DATAFLOW_LABELS)],
    [UI_TEXT.prometric, answerLabel(payload.prometric, PROMETRIC_LABELS)],
    ...payload.answers.map((answer): [string, string] => [answer.question, selectedChoices(answer).join("\n")]),
    [UI_TEXT.experienceYears, payload.experienceYears === undefined ? null : String(payload.experienceYears)],
    [UI_TEXT.applicationNote, payload.note],
    [UI_TEXT.consent, UI_TEXT.consentGiven],
  ];
  return answers.flatMap(([label, value]) => (value === null ? [] : [{ label, value }]));
}

/** A CV's name as uploaded, kept only to be shown and attached: tidied, bounded, never a path. */
const uploadedName = (name: string) =>
  normaliseLine(name.replace(/^.*[\\/]/, "")).slice(0, TEXT_LIMITS.fileName) || "cv";

/**
 * Saves a CV while the applicant waits (D84): tried again after a pause, 3
 * tries in all, and a folder past its budget not tried again. Then the
 * applicant is asked to send it again, beside the CV and above the send
 * action, with nothing lost from the form; the cause goes to the error log.
 */
async function saveCvTrying(cv: CvToStore): Promise<string> {
  for (let tried = 1; ; tried++) {
    try {
      return await saveCv(cv);
    } catch (error) {
      const full = isAppError(error) && error.code === "STORAGE_FULL";
      if (full || tried === CV_SAVE_RETRIES.tries) {
        throw internalError("CV_NOT_SAVED", [{ path: "cv", message: ERROR_MESSAGES.CV_NOT_SAVED }], error);
      }
      await new Promise((resolve) => setTimeout(resolve, CV_SAVE_RETRIES.pauseMs * tried));
    }
  }
}

/**
 * An application as the route received it (plan §9.3): the CV must be a PDF
 * or Word file by its first bytes; then the row is stored with the CV saved
 * in the private CV folder, in one transaction (steps 1 – 3, D84): a CV that
 * cannot be saved keeps nothing, and the applicant sends it again. The CV's
 * bytes are answered too, for the HR email to carry (step 4).
 */
export async function receiveApplication(
  payload: ApplicationFormPayload,
  visitorIp: string,
  at: Date = new Date(),
): Promise<{ id: string; cv: Uint8Array }> {
  const bytes = new Uint8Array(await payload.cv.arrayBuffer());
  const type = detectFileType(bytes);
  if (type === null || !CV_TYPES.includes(type)) {
    throw validationError("VALIDATION_ERROR", [{ path: "cv", message: VALIDATION_MESSAGES.cvType }]);
  }
  const { jobId, name, email, phone, answers, experienceYears } = payload;
  const { id } = await submitApplication(
    {
      jobId,
      name,
      email,
      phone,
      fields: applicationFields(payload),
      answers,
      experienceYears,
      screeningAnswers: APPLICATION_SCREENING_FIELDS.filter((field) => payload[field] !== undefined),
      cv: { name: uploadedName(payload.cv.name), type, bytes: bytes.byteLength },
    },
    visitorIp,
    at,
    (jobTitle) => saveCvTrying({ bytes, type, jobTitle, applicantName: name, receivedAt: at }),
  );
  return { id, cv: bytes };
}

/** The kept CV, for a Retry: none when it was never kept or has expired, or when it cannot be read (logged). */
async function keptCv(id: string, application: { cvKey: string | null; cvStatus: string }): Promise<Uint8Array | null> {
  if (application.cvStatus !== "STORED" || !application.cvKey) return null;
  try {
    return await readCv(application.cvKey);
  } catch (error) {
    await captureError({ message: "Application CV not read", error, context: { applicationId: id } });
    return null;
  }
}

/**
 * The HR email for an application (plan §9.3 step 4, §17): to the
 * applications recipients set in Operations, Reply-To the applicant, with
 * every answer and the CV attached: as received (`cv`), or the kept one on a
 * Retry. Without either it says the CV is not attached. The application is
 * marked sent or not sent; a failure is logged by its id alone, nothing
 * personal, and the application stays, with Retry in the inbox.
 */
export async function sendApplicationAlert(id: string, cv: Uint8Array | null = null): Promise<EmailStatus> {
  const db = getDb();
  const [application] = await db
    .select({
      name: applications.name,
      email: applications.email,
      jobTitle: applications.jobTitle,
      fields: applications.fields,
      cvKey: applications.cvKey,
      cvName: applications.cvName,
      cvType: applications.cvType,
      cvBytes: applications.cvBytes,
      cvStatus: applications.cvStatus,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .where(eq(applications.id, id));
  if (!application) throw notFoundError("RECORD_NOT_FOUND");

  let status: EmailStatus = "SENT";
  try {
    const type = application.cvType as FileType;
    const content = cv ?? (await keptCv(id, application));
    // The CV goes under the name it is kept by: readable, and nothing the applicant typed unsanitised.
    const key =
      application.cvKey ??
      newCvKey({
        type,
        jobTitle: application.jobTitle,
        applicantName: application.name,
        receivedAt: application.createdAt,
      });
    const { applicationsTo } = await getOperations();
    await createConfiguredMailService().sendApplicationAlert({
      id,
      to: applicationsTo,
      replyTo: application.email,
      name: application.name,
      jobTitle: application.jobTitle,
      receivedAt: application.createdAt,
      fields: application.fields,
      cv: { name: application.cvName, bytes: application.cvBytes },
      attachment: content
        ? { filename: key.slice(key.indexOf("/") + 1), content, contentType: FILE_TYPES[type].mime }
        : null,
    });
  } catch (error) {
    status = "NOT_SENT";
    await captureError({ message: "Application alert email not sent", error, context: { applicationId: id } });
  }
  await db.update(applications).set({ emailStatus: status, updatedAt: new Date() }).where(eq(applications.id, id));
  return status;
}

/** The admin's Retry (plan §9.3): an HR email not sent is sent again, with the kept CV, and the try is recorded. */
export async function retryApplicationAlert(id: string, actor: Actor): Promise<EmailStatus> {
  const [application] = await getDb()
    .select({ emailStatus: applications.emailStatus })
    .from(applications)
    .where(eq(applications.id, id));
  if (!application) throw notFoundError("RECORD_NOT_FOUND");
  if (application.emailStatus === "SENT") throw businessRuleError("EMAIL_ALREADY_SENT");
  const status = await sendApplicationAlert(id);
  await logActionSafe({
    actorId: actor.adminId,
    action: "UPDATE",
    entityType: AUDIT_ENTITIES.application,
    entityId: id,
    changes: { emailStatus: { from: application.emailStatus, to: status } },
    requestId: actor.requestId,
  });
  return status;
}

/** The mail-retry cron's work for applications (D85): each HR email not sent, sent again with the kept CV. */
export function retryApplicationAlerts(at?: Date): Promise<RetryRun> {
  return retryUnsentMail(applications, (id) => sendApplicationAlert(id), at);
}

/** An application as the inbox lists it (plan §9.5). */
export interface ApplicationSummary {
  id: string;
  /** The job applied for, and its title as applied for; both null for a general application. */
  jobId: string | null;
  jobTitle: string | null;
  status: ApplicationStatus;
  emailStatus: EmailStatus;
  cvStatus: CvStatus;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

/** A note on an application, by the admin who wrote it (the name is gone if the admin is). */
export interface ApplicationNote {
  id: string;
  body: string;
  author: string | null;
  createdAt: Date;
}

/** An application opened in the inbox: every answer as sent, its CV as uploaded, and its notes, oldest first. */
export interface ApplicationDetail extends ApplicationSummary {
  fields: SubmittedField[];
  /** How often the mail-retry cron has sent its HR email again (D85). */
  emailRetries: number;
  cvName: string;
  cvType: FileType;
  cvBytes: number;
  updatedAt: Date;
  notes: ApplicationNote[];
}

/** A job the inbox can be filtered by: one that has applications, by its title as last applied for. */
export interface AppliedJob {
  id: string;
  title: string;
}

const applicationSummary = {
  id: applications.id,
  jobId: applications.jobId,
  jobTitle: applications.jobTitle,
  status: applications.status,
  emailStatus: applications.emailStatus,
  cvStatus: applications.cvStatus,
  name: applications.name,
  email: applications.email,
  phone: applications.phone,
  createdAt: applications.createdAt,
};

/**
 * The inbox (plan §9.5): applications newest first, by job (or the general
 * ones), by status, by whether they need the admin (new, or the HR email not
 * sent) and by a search, a page at a time, with how many there are in all and
 * the jobs that have applications, for the filter: read together.
 */
export async function listApplications(query: ApplicationListQueryPayload): Promise<{
  items: ApplicationSummary[];
  total: number;
  page: number;
  pageSize: number;
  jobs: AppliedJob[];
}> {
  const where = and(
    query.job === GENERAL_APPLICATIONS
      ? isNull(applications.jobId)
      : query.job
        ? eq(applications.jobId, query.job)
        : undefined,
    query.status ? eq(applications.status, query.status) : undefined,
    query.needsYou ? needsAttention(applications) : undefined,
    query.q ? matchingPerson(query.q, applications) : undefined,
  );
  const db = getDb();
  const latest = max(applications.createdAt);
  const [rows, [{ total }], applied] = await Promise.all([
    db
      .select(applicationSummary)
      .from(applications)
      .where(where)
      .orderBy(desc(applications.createdAt), desc(applications.id))
      .limit(INBOX_PAGE_SIZE)
      .offset((query.page - 1) * INBOX_PAGE_SIZE),
    db.select({ total: count() }).from(applications).where(where),
    db
      .select({ id: applications.jobId, title: applications.jobTitle })
      .from(applications)
      .where(isNotNull(applications.jobId))
      .groupBy(applications.jobId, applications.jobTitle)
      .orderBy(desc(latest)),
  ]);
  // A job renamed between applications is listed once, by the title it was last applied for under.
  const jobs = new Map<string, string>();
  for (const job of applied) if (!jobs.has(job.id!)) jobs.set(job.id!, job.title!);
  return {
    items: rows as ApplicationSummary[],
    total,
    page: query.page,
    pageSize: INBOX_PAGE_SIZE,
    jobs: [...jobs].map(([id, title]) => ({ id, title })),
  };
}

/** Applications by their ids, as the inbox lists them, for Today's stream (D81). */
export async function applicationSummaries(ids: string[]): Promise<ApplicationSummary[]> {
  const rows = await getDb().select(applicationSummary).from(applications).where(inArray(applications.id, ids));
  return rows as ApplicationSummary[];
}

/** One application with its notes (plan §9.5): two reads. */
export async function getApplication(id: string): Promise<ApplicationDetail> {
  const db = getDb();
  const [[application], notes] = await Promise.all([
    db
      .select({
        ...applicationSummary,
        fields: applications.fields,
        emailRetries: applications.emailRetries,
        cvName: applications.cvName,
        cvType: applications.cvType,
        cvBytes: applications.cvBytes,
        updatedAt: applications.updatedAt,
      })
      .from(applications)
      .where(eq(applications.id, id)),
    db
      .select({
        id: applicationNotes.id,
        body: applicationNotes.body,
        author: authUser.name,
        createdAt: applicationNotes.createdAt,
      })
      .from(applicationNotes)
      .leftJoin(authUser, eq(authUser.id, applicationNotes.createdBy))
      .where(eq(applicationNotes.applicationId, id))
      .orderBy(asc(applicationNotes.createdAt), asc(applicationNotes.id)),
  ]);
  if (!application) throw notFoundError("RECORD_NOT_FOUND");
  return { ...(application as Omit<ApplicationDetail, "notes">), notes };
}

/** Moves an application along (plan §9.5); recorded with where it was and where it went. */
export async function setApplicationStatus(id: string, status: ApplicationStatus, actor: Actor): Promise<void> {
  const db = getDb();
  const [application] = await db
    .select({ status: applications.status })
    .from(applications)
    .where(eq(applications.id, id));
  if (!application) throw notFoundError("RECORD_NOT_FOUND");
  if (application.status === status) return;
  await db.update(applications).set({ status, updatedAt: new Date() }).where(eq(applications.id, id));
  await logActionSafe({
    actorId: actor.adminId,
    action: "STATUS_CHANGE",
    entityType: AUDIT_ENTITIES.application,
    entityId: id,
    changes: { status: { from: application.status, to: status } },
    requestId: actor.requestId,
  });
}

/**
 * The team's note on an application (plan §9.5). It may hold personal data,
 * so the audit trail records that a note was added, never what it says
 * (AGENTS.md §8); it goes with the application.
 */
export async function addApplicationNote(id: string, body: string, actor: Actor): Promise<ApplicationNote> {
  const noteId = newId();
  const at = new Date();
  try {
    await getDb()
      .insert(applicationNotes)
      .values({ id: noteId, applicationId: id, body, createdBy: actor.adminId, createdAt: at, updatedAt: at });
  } catch (error) {
    // A note points at its application and its admin: one of them is gone (the admin's session would be too).
    if (referencesMissingRow(error)) throw notFoundError("RECORD_NOT_FOUND");
    throw fromDatabaseError(error);
  }
  await logActionSafe({
    actorId: actor.adminId,
    action: "NOTE_ADD",
    entityType: AUDIT_ENTITIES.application,
    entityId: id,
    requestId: actor.requestId,
  });
  const [author] = actor.adminId
    ? await getDb().select({ name: authUser.name }).from(authUser).where(eq(authUser.id, actor.adminId))
    : [];
  return { id: noteId, body, author: author?.name ?? null, createdAt: at };
}

/**
 * An application's CV, for the signed-in admin's download (plan §9.4): only
 * a kept one, under the name it is kept by, and every download recorded.
 */
export async function downloadApplicationCv(
  id: string,
  actor: Actor,
): Promise<{ bytes: Uint8Array; filename: string; contentType: string }> {
  const [application] = await getDb()
    .select({ cvKey: applications.cvKey, cvStatus: applications.cvStatus, cvType: applications.cvType })
    .from(applications)
    .where(eq(applications.id, id));
  if (!application) throw notFoundError("RECORD_NOT_FOUND");
  const bytes = await keptCv(id, application);
  if (!bytes) throw notFoundError("CV_NOT_KEPT");
  await logActionSafe({
    actorId: actor.adminId,
    action: "CV_DOWNLOAD",
    entityType: AUDIT_ENTITIES.application,
    entityId: id,
    requestId: actor.requestId,
  });
  const key = application.cvKey!;
  return {
    bytes,
    filename: key.slice(key.indexOf("/") + 1),
    contentType: FILE_TYPES[application.cvType as FileType].mime,
  };
}

/**
 * Deletes an application at once (D82): its CV file first, so a file that
 * cannot be removed leaves the application to try again, then the row with
 * its notes. Recorded without anything it held (AGENTS.md §8).
 */
export async function deleteApplication(id: string, actor: Actor): Promise<void> {
  const db = getDb();
  const [application] = await db
    .select({ cvKey: applications.cvKey })
    .from(applications)
    .where(eq(applications.id, id));
  if (!application) throw notFoundError("RECORD_NOT_FOUND");
  if (application.cvKey) await deleteCv(application.cvKey);
  await db.delete(applications).where(eq(applications.id, id));
  await logActionSafe({
    actorId: actor.adminId,
    action: "DELETE",
    entityType: AUDIT_ENTITIES.application,
    entityId: id,
    requestId: actor.requestId,
  });
}
