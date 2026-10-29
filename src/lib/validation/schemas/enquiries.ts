import * as z from "zod";

import { TEXT_LIMITS } from "@/constants/limits";
import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { CARE_FOR, CONTACT_METHODS, ENQUIRY_STATUSES, FORM_KINDS } from "@/constants/statuses";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";

import { optionalLine, requiredEmail, requiredLine, requiredLines, requiredPhone } from "../primitives";

/**
 * The Quote and Contact forms (plan §10.1, §10.2), each field named by the
 * label the visitor sees. The browser checks a form with its own schema; the
 * route reads either through `enquirySchema`, which the form's kind decides.
 */
const name = requiredLine(UI_TEXT.yourName, { max: TEXT_LIMITS.name });
const phone = requiredPhone(UI_TEXT.phone);
const email = requiredEmail(UI_TEXT.email);
const message = requiredLines(UI_TEXT.message, { max: TEXT_LIMITS.message });
const consent = z.literal(true, { error: VALIDATION_MESSAGES.consent });
/** Turnstile's token (plan §10.3): present once the check has passed; the route verifies it with Cloudflare. */
const botCheck = {
  [TURNSTILE_FIELD]: z
    .string({ error: VALIDATION_MESSAGES.botCheck })
    .min(1, VALIDATION_MESSAGES.botCheck)
    .max(TEXT_LIMITS.turnstileToken),
};

export const contactFormSchema = z.object({ name, phone, email, message, consent, ...botCheck });
export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormPayload = z.output<typeof contactFormSchema>;

export const quoteFormSchema = z.object({
  name,
  organisation: optionalLine(UI_TEXT.organisation, TEXT_LIMITS.line),
  careFor: z.enum(CARE_FOR, { error: VALIDATION_MESSAGES.careFor }),
  /** A published service's slug, or null for "not sure yet"; the route checks it is one (§10.1). */
  service: optionalLine(UI_TEXT.service, TEXT_LIMITS.slug),
  phone,
  email,
  contactMethod: z.enum(CONTACT_METHODS, { error: VALIDATION_MESSAGES.contactMethod }),
  message,
  consent,
  ...botCheck,
});
export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export type QuoteFormPayload = z.output<typeof quoteFormSchema>;

/** What `POST /api/enquiries` accepts: either form, named by its kind. */
export const enquirySchema = z.discriminatedUnion("form", [
  contactFormSchema.extend({ form: z.literal("CONTACT") }),
  quoteFormSchema.extend({ form: z.literal("QUOTE") }),
]);
export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryPayload = z.output<typeof enquirySchema>;

/**
 * The enquiries inbox (plan §10.5): which enquiries to list, newest first,
 * by form, by status and by what the admin types (a name, an email, a phone
 * number), a page at a time.
 */
export const enquiryListQuerySchema = z.object({
  form: z.enum(FORM_KINDS).optional(),
  status: z.enum(ENQUIRY_STATUSES).optional(),
  q: optionalLine("Search", TEXT_LIMITS.line),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});
export type EnquiryListQueryInput = z.input<typeof enquiryListQuerySchema>;
export type EnquiryListQueryPayload = z.output<typeof enquiryListQuerySchema>;

/** Where an enquiry stands (plan §10.5). */
export const enquiryStatusSchema = z.object({ status: z.enum(ENQUIRY_STATUSES) });
export type EnquiryStatusInput = z.input<typeof enquiryStatusSchema>;
export type EnquiryStatusPayload = z.output<typeof enquiryStatusSchema>;

/** The team's internal note on an enquiry (plan §10.5). */
export const enquiryNoteSchema = z.object({ body: requiredLines("Note", { max: TEXT_LIMITS.note }) });
export type EnquiryNoteInput = z.input<typeof enquiryNoteSchema>;
export type EnquiryNotePayload = z.output<typeof enquiryNoteSchema>;
