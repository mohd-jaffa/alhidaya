import { MAIL_TEXT } from "@/constants/messages";
import type { FormKind } from "@/constants/statuses";
import { dohaDateTime } from "@/lib/dates";

import { emailHtml, emailText, type EmailParts } from "./layout";

export interface EnquiryAlertInput {
  siteUrl: string;
  form: FormKind;
  name: string;
  receivedAt: Date;
  /** Every answer under the label the visitor saw (plan §10.4). */
  fields: readonly { label: string; value: string }[];
  /** The enquiry in the admin's inbox. */
  inboxUrl: string;
}

/** A new enquiry, for the team (plan §10.4, §17): who sent it, when, every answer, and the way to the inbox. */
export function enquiryAlertTemplate(input: EnquiryAlertInput) {
  const words = MAIL_TEXT.enquiryAlert;
  const form = words[input.form];
  const subject = form.subject(input.name);
  const parts: EmailParts = {
    siteUrl: input.siteUrl,
    subject,
    preheader: form.preheader,
    heading: form.heading,
    paragraphs: [words.received(input.name, form.form, dohaDateTime(input.receivedAt))],
    details: input.fields,
    action: { label: words.action, url: input.inboxUrl, fallback: MAIL_TEXT.linkFallback },
    footnote: words.footnote(input.name),
  };
  return { subject, text: emailText(parts), html: emailHtml(parts) };
}
