import { PASSWORD_RESET_MINUTES } from "@/constants/limits";
import { MAIL_TEXT } from "@/constants/messages";

import { emailHtml, emailText, type EmailParts } from "./layout";

export interface PasswordResetInput {
  siteUrl: string;
  name: string;
  resetUrl: string;
}

/** The link that lets the admin choose a new password (plan §26.4). */
export function passwordResetTemplate(input: PasswordResetInput) {
  const text = MAIL_TEXT.passwordReset;
  const parts: EmailParts = {
    siteUrl: input.siteUrl,
    subject: text.subject,
    preheader: text.preheader,
    heading: text.heading,
    paragraphs: [MAIL_TEXT.greeting(input.name), text.body],
    action: { label: text.action, url: input.resetUrl, fallback: MAIL_TEXT.linkFallback },
    note: MAIL_TEXT.linkValid(PASSWORD_RESET_MINUTES),
    footnote: text.footnote,
  };
  return { subject: text.subject, text: emailText(parts), html: emailHtml(parts) };
}
