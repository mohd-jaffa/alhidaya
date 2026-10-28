/** A file sent with an email: the CV with an application (plan §9.3). */
export interface MailAttachment {
  filename: string;
  content: Uint8Array;
  contentType: string;
}

/** One email, as a provider sends it. */
export interface MailMessage {
  from: string;
  to: string | string[];
  /** Where a reply goes: the visitor who wrote, so the team answers them directly (plan §17). */
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
}

/**
 * Whatever delivers mail (plan §17, D17): SMTP through nodemailer, the
 * server's cPanel mail in production and Mailpit locally. Changing provider
 * is an env change, or one new implementation of this, and nothing else.
 */
export interface MailProvider {
  send(message: MailMessage): Promise<void>;
}
