import { eq } from "drizzle-orm";

import { FORM_RATE_LIMIT } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { CARE_FOR_LABELS, CONTACT_METHOD_LABELS, type EmailStatus, type FormKind } from "@/constants/statuses";
import { getDb } from "@/db/client";
import { enquiries, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { listPublishedServices } from "@/features/services/api";
import { logActionSafe } from "@/lib/audit/auditLog";
import { captureError } from "@/lib/audit/errorLog";
import { displayPhone } from "@/lib/contact";
import type { Actor } from "@/lib/content/actor";
import { getOperations } from "@/lib/content/operations";
import { businessRuleError, notFoundError, rateLimitError, validationError } from "@/lib/errors";
import { createConfiguredMailService } from "@/lib/mail/nodemailer.provider";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";
import type { EnquiryPayload } from "@/lib/validation";

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
    entityType: "enquiry",
    entityId: id,
    changes: { emailStatus: { from: enquiry.emailStatus, to: status } },
    requestId: actor.requestId,
  });
  return status;
}
