import { MAIL_TEXT } from "@/constants/messages";
import { dohaDateTime } from "@/lib/dates";
import { formatBytes } from "@/lib/files/size";

import { emailHtml, emailText, type EmailParts } from "./layout";

export interface ApplicationAlertInput {
  siteUrl: string;
  name: string;
  /** The job as applied for; null for a general application (plan Q7). */
  jobTitle: string | null;
  receivedAt: Date;
  /** Every answer under the label the applicant saw (plan §9.3). */
  fields: readonly { label: string; value: string }[];
  /** The CV as uploaded, and the name it is attached under, or null when it is not attached. */
  cv: { name: string; bytes: number; attachedAs: string | null };
  /** The application in the admin's inbox. */
  inboxUrl: string;
}

/**
 * A new application, for HR (plan §9.3, §17): who applied, for which job and
 * when, whether the CV is attached, every answer, and the way to the inbox.
 */
export function applicationAlertTemplate(input: ApplicationAlertInput) {
  const words = MAIL_TEXT.applicationAlert;
  const subject = words.subject(input.name, input.jobTitle);
  const parts: EmailParts = {
    siteUrl: input.siteUrl,
    subject,
    preheader: words.preheader,
    heading: words.heading(input.jobTitle),
    paragraphs: [
      words.received(input.name, input.jobTitle, dohaDateTime(input.receivedAt)),
      input.cv.attachedAs ? words.cvAttached(input.cv.attachedAs) : words.cvNotAttached,
    ],
    details: [
      { label: words.job, value: input.jobTitle ?? words.general },
      ...input.fields,
      { label: words.cv, value: `${input.cv.name} · ${formatBytes(input.cv.bytes)}` },
    ],
    action: { label: words.action, url: input.inboxUrl, fallback: MAIL_TEXT.linkFallback },
    footnote: words.footnote(input.name),
  };
  return { subject, text: emailText(parts), html: emailHtml(parts) };
}
