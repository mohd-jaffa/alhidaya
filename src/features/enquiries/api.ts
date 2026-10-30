import { and, asc, count, desc, eq, inArray } from "drizzle-orm";

import { FORM_RATE_LIMIT, INBOX_PAGE_SIZE, INBOX_SUMMARY_LENGTH } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import {
  AUDIT_ENTITIES,
  CARE_FOR_LABELS,
  CONTACT_METHOD_LABELS,
  type EmailStatus,
  type EnquiryStatus,
  type FormKind,
} from "@/constants/statuses";
import { getDb } from "@/db/client";
import { authUser, enquiries, enquiryNotes, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { listPublishedServices } from "@/features/services/api";
import { logActionSafe } from "@/lib/audit/auditLog";
import { captureError } from "@/lib/audit/errorLog";
import { needsAttention } from "@/lib/inbox/arrivals";
import { type RetryRun, retryUnsentMail } from "@/lib/inbox/mail-retry";
import { displayPhone } from "@/lib/contact";
import type { Actor } from "@/lib/content/actor";
import { getOperations } from "@/lib/content/operations";
import {
  businessRuleError,
  fromDatabaseError,
  notFoundError,
  rateLimitError,
  referencesMissingRow,
  validationError,
} from "@/lib/errors";
import { createConfiguredMailService } from "@/lib/mail/nodemailer.provider";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";
import { matchingPerson } from "@/lib/text/search";
import type { EnquiryListQueryPayload, EnquiryPayload } from "@/lib/validation";

/** A Quote or Contact submission, parsed by its form's schema and labelled as the visitor saw it. */
export interface EnquirySubmission {
  form: FormKind;
  name: string;
  email: string;
  phone: string;
  fields: SubmittedField[];
}

/**
 * Stores an enquiry (plan §10.3, §10.4) in one transaction with its rate
 * limit, per form and per visitor: past the limit nothing is stored, and a
 * submission that fails to store is not counted. Answers the enquiry's id;
 * the alert email follows it (`sendEnquiryAlert`).
 */
export async function submitEnquiry(
  submission: EnquirySubmission,
  visitorIp: string,
  at: Date = new Date(),
): Promise<string> {
  const id = newId();
  await getDb().transaction(async (tx) => {
    const rule = { scope: `enquiry:${submission.form}`, key: visitorIp, ...FORM_RATE_LIMIT };
    if (!(await consumeRateLimit(rule, at, tx))) throw rateLimitError("RATE_LIMITED");
    await tx.insert(enquiries).values({ id, ...submission, createdAt: at, updatedAt: at });
  });
  return id;
}

/**
 * Every answer as the visitor saw and gave it (plan §10.4): each field's
 * label, and a choice's words rather than its code, so the inbox reads the
 * enquiry as it was sent whatever the form says later; a phone number as it
 * is read ("+974 5551 2345"). Left-out answers are left out.
 */
export function enquiryFields(payload: EnquiryPayload, serviceName: string | null): SubmittedField[] {
  const answers: [string, string | null][] =
    payload.form === "QUOTE"
      ? [
          [UI_TEXT.yourName, payload.name],
          [UI_TEXT.organisation, payload.organisation],
          [UI_TEXT.careFor, CARE_FOR_LABELS[payload.careFor]],
          [UI_TEXT.service, serviceName],
          [UI_TEXT.phone, displayPhone(payload.phone)],
          [UI_TEXT.email, payload.email],
          [UI_TEXT.contactMethod, CONTACT_METHOD_LABELS[payload.contactMethod]],
          [UI_TEXT.message, payload.message],
        ]
      : [
          [UI_TEXT.yourName, payload.name],
          [UI_TEXT.phone, displayPhone(payload.phone)],
          [UI_TEXT.email, payload.email],
          [UI_TEXT.message, payload.message],
        ];
  return [...answers, [UI_TEXT.consent, UI_TEXT.consentGiven] as const].flatMap(([label, value]) =>
    value === null ? [] : [{ label, value }],
  );
}

/** The name of the published service at `slug`, as the visitor chose it; null when none is published there. */
async function publishedServiceName(slug: string): Promise<string | null> {
  const services = await listPublishedServices();
  return services.find((service) => service.published.slug === slug)?.published.name.en ?? null;
}

/**
 * A Quote or Contact form as the route received it (plan §10.4): the chosen
 * service must be one the site shows, then the enquiry is stored with its
 * answers as the visitor saw them.
 */
export async function receiveEnquiry(
  payload: EnquiryPayload,
  visitorIp: string,
  at: Date = new Date(),
): Promise<string> {
  const chosen = payload.form === "QUOTE" ? payload.service : null;
  const serviceName = chosen ? await publishedServiceName(chosen) : null;
  if (chosen && !serviceName) {
    throw validationError("VALIDATION_ERROR", [{ path: "service", message: VALIDATION_MESSAGES.service }]);
  }
  const { form, name, email, phone } = payload;
  return submitEnquiry({ form, name, email, phone, fields: enquiryFields(payload, serviceName) }, visitorIp, at);
}

/**
 * The alert for an enquiry (plan §10.4, §17): to the enquiries recipients
 * set in Operations, Reply-To the visitor, with every answer. The enquiry is
 * marked sent or not sent; a failure is logged by the enquiry's id alone,
 * nothing personal, and the enquiry stays, with Retry in the inbox.
 */
export async function sendEnquiryAlert(id: string): Promise<EmailStatus> {
  const db = getDb();
  const [enquiry] = await db
    .select({
      form: enquiries.form,
      name: enquiries.name,
      email: enquiries.email,
      fields: enquiries.fields,
      createdAt: enquiries.createdAt,
    })
    .from(enquiries)
    .where(eq(enquiries.id, id));
  if (!enquiry) throw notFoundError("RECORD_NOT_FOUND");

  let status: EmailStatus = "SENT";
  try {
    const { enquiriesTo } = await getOperations();
    await createConfiguredMailService().sendEnquiryAlert({
      id,
      to: enquiriesTo,
      replyTo: enquiry.email,
      form: enquiry.form as FormKind,
      name: enquiry.name,
      receivedAt: enquiry.createdAt,
      fields: enquiry.fields,
    });
  } catch (error) {
    status = "NOT_SENT";
    await captureError({ message: "Enquiry alert email not sent", error, context: { enquiryId: id } });
  }
  await db.update(enquiries).set({ emailStatus: status, updatedAt: new Date() }).where(eq(enquiries.id, id));
  return status;
}

/** The admin's Retry (plan §10.4): an alert not sent is sent again, and the try is recorded. */
export async function retryEnquiryAlert(id: string, actor: Actor): Promise<EmailStatus> {
  const [enquiry] = await getDb()
    .select({ emailStatus: enquiries.emailStatus })
    .from(enquiries)
    .where(eq(enquiries.id, id));
  if (!enquiry) throw notFoundError("RECORD_NOT_FOUND");
  if (enquiry.emailStatus === "SENT") throw businessRuleError("EMAIL_ALREADY_SENT");
  const status = await sendEnquiryAlert(id);
  await logActionSafe({
    actorId: actor.adminId,
    action: "UPDATE",
    entityType: AUDIT_ENTITIES.enquiry,
    entityId: id,
    changes: { emailStatus: { from: enquiry.emailStatus, to: status } },
    requestId: actor.requestId,
  });
  return status;
}

/** An enquiry as the inbox lists it (plan §10.5): `summary` is its line under the name. */
export interface EnquirySummary {
  id: string;
  form: FormKind;
  status: EnquiryStatus;
  emailStatus: EmailStatus;
  name: string;
  email: string;
  phone: string;
  summary: string;
  createdAt: Date;
}

/** A note on an enquiry, by the admin who wrote it (the name is gone if the admin is). */
export interface EnquiryNote {
  id: string;
  body: string;
  author: string | null;
  createdAt: Date;
}

/** An enquiry opened in the inbox: every answer as sent, and its notes, oldest first. */
export interface EnquiryDetail extends Omit<EnquirySummary, "summary"> {
  fields: SubmittedField[];
  /** How often the mail-retry cron has sent its alert again (D85). */
  emailRetries: number;
  updatedAt: Date;
  notes: EnquiryNote[];
}

const summary = {
  id: enquiries.id,
  form: enquiries.form,
  status: enquiries.status,
  emailStatus: enquiries.emailStatus,
  name: enquiries.name,
  email: enquiries.email,
  phone: enquiries.phone,
  createdAt: enquiries.createdAt,
};

/**
 * A row's line under the name (R6.1): a quote's service and organisation, or
 * else the first line of the message, cut to fit. Found by the labels the
 * visitor saw, as the enquiry keeps them.
 */
function summarise(form: FormKind, fields: SubmittedField[]): string {
  const answer = (label: string) => fields.find((field) => field.label === label)?.value;
  const named = form === "QUOTE" ? [answer(UI_TEXT.service), answer(UI_TEXT.organisation)].filter(Boolean) : [];
  if (named.length > 0) return named.join(" · ");
  const line = answer(UI_TEXT.message)?.split("\n")[0] ?? "";
  return line.length > INBOX_SUMMARY_LENGTH ? `${line.slice(0, INBOX_SUMMARY_LENGTH - 1)}…` : line;
}

/**
 * The inbox (plan §10.5): enquiries newest first, by form, by status, by
 * whether they need the admin (new, or the alert not sent) and by a search,
 * a page at a time, with how many there are in all: two reads.
 */
export async function listEnquiries(
  query: EnquiryListQueryPayload,
): Promise<{ items: EnquirySummary[]; total: number; page: number; pageSize: number }> {
  const where = and(
    query.form ? eq(enquiries.form, query.form) : undefined,
    query.status ? eq(enquiries.status, query.status) : undefined,
    query.needsYou ? needsAttention(enquiries) : undefined,
    query.q ? matchingPerson(query.q, enquiries) : undefined,
  );
  const db = getDb();
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ ...summary, fields: enquiries.fields })
      .from(enquiries)
      .where(where)
      .orderBy(desc(enquiries.createdAt), desc(enquiries.id))
      .limit(INBOX_PAGE_SIZE)
      .offset((query.page - 1) * INBOX_PAGE_SIZE),
    db.select({ total: count() }).from(enquiries).where(where),
  ]);
  return { items: rows.map(summarised), total, page: query.page, pageSize: INBOX_PAGE_SIZE };
}

/** A row as the inbox lists it, its line under the name made from its answers. */
const summarised = ({ fields, ...row }: Record<keyof typeof summary, unknown> & { fields: SubmittedField[] }) => ({
  ...(row as Omit<EnquirySummary, "summary">),
  summary: summarise(row.form as FormKind, fields),
});

/** Enquiries by their ids, as the inbox lists them, for Today's stream (D81). */
export async function enquirySummaries(ids: string[]): Promise<EnquirySummary[]> {
  const rows = await getDb()
    .select({ ...summary, fields: enquiries.fields })
    .from(enquiries)
    .where(inArray(enquiries.id, ids));
  return rows.map(summarised);
}

/** One enquiry with its notes (plan §10.5): two reads. */
export async function getEnquiry(id: string): Promise<EnquiryDetail> {
  const db = getDb();
  const [[enquiry], notes] = await Promise.all([
    db
      .select({
        ...summary,
        fields: enquiries.fields,
        emailRetries: enquiries.emailRetries,
        updatedAt: enquiries.updatedAt,
      })
      .from(enquiries)
      .where(eq(enquiries.id, id)),
    db
      .select({
        id: enquiryNotes.id,
        body: enquiryNotes.body,
        author: authUser.name,
        createdAt: enquiryNotes.createdAt,
      })
      .from(enquiryNotes)
      .leftJoin(authUser, eq(authUser.id, enquiryNotes.createdBy))
      .where(eq(enquiryNotes.enquiryId, id))
      .orderBy(asc(enquiryNotes.createdAt), asc(enquiryNotes.id)),
  ]);
  if (!enquiry) throw notFoundError("RECORD_NOT_FOUND");
  return { ...(enquiry as Omit<EnquiryDetail, "notes">), notes };
}

/** The mail-retry cron's work for enquiries (D85): each alert not sent, sent again while it has tries left. */
export function retryEnquiryAlerts(at?: Date): Promise<RetryRun> {
  return retryUnsentMail(enquiries, sendEnquiryAlert, at);
}

/** Moves an enquiry along (plan §10.5); recorded with where it was and where it went. */
export async function setEnquiryStatus(id: string, status: EnquiryStatus, actor: Actor): Promise<void> {
  const db = getDb();
  const [enquiry] = await db.select({ status: enquiries.status }).from(enquiries).where(eq(enquiries.id, id));
  if (!enquiry) throw notFoundError("RECORD_NOT_FOUND");
  if (enquiry.status === status) return;
  await db.update(enquiries).set({ status, updatedAt: new Date() }).where(eq(enquiries.id, id));
  await logActionSafe({
    actorId: actor.adminId,
    action: "STATUS_CHANGE",
    entityType: AUDIT_ENTITIES.enquiry,
    entityId: id,
    changes: { status: { from: enquiry.status, to: status } },
    requestId: actor.requestId,
  });
}

/**
 * The team's note on an enquiry (plan §10.5). It may hold personal data, so
 * the audit trail records that a note was added, never what it says
 * (AGENTS.md §8); it goes with the enquiry when retention deletes it.
 */
export async function addEnquiryNote(id: string, body: string, actor: Actor): Promise<EnquiryNote> {
  const noteId = newId();
  const at = new Date();
  try {
    await getDb()
      .insert(enquiryNotes)
      .values({ id: noteId, enquiryId: id, body, createdBy: actor.adminId, createdAt: at, updatedAt: at });
  } catch (error) {
    // A note points at its enquiry and its admin: one of them is gone (the admin's session would be too).
    if (referencesMissingRow(error)) throw notFoundError("RECORD_NOT_FOUND");
    throw fromDatabaseError(error);
  }
  await logActionSafe({
    actorId: actor.adminId,
    action: "NOTE_ADD",
    entityType: AUDIT_ENTITIES.enquiry,
    entityId: id,
    requestId: actor.requestId,
  });
  const [author] = actor.adminId
    ? await getDb().select({ name: authUser.name }).from(authUser).where(eq(authUser.id, actor.adminId))
    : [];
  return { id: noteId, body, author: author?.name ?? null, createdAt: at };
}

/** Deletes an enquiry at once, with its notes (D82); recorded without anything it held (AGENTS.md §8). */
export async function deleteEnquiry(id: string, actor: Actor): Promise<void> {
  const [{ affectedRows }] = await getDb().delete(enquiries).where(eq(enquiries.id, id));
  if (affectedRows === 0) throw notFoundError("RECORD_NOT_FOUND");
  await logActionSafe({
    actorId: actor.adminId,
    action: "DELETE",
    entityType: AUDIT_ENTITIES.enquiry,
    entityId: id,
    requestId: actor.requestId,
  });
}
