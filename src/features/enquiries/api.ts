import { FORM_RATE_LIMIT } from "@/constants/limits";
import type { FormKind } from "@/constants/statuses";
import { getDb } from "@/db/client";
import { enquiries, type SubmittedField } from "@/db/schema";
import { newId } from "@/db/schema/columns";
import { rateLimitError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit/rate-limit";

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
 * the alert email follows it (R4.3).
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
