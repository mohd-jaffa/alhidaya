import { ADMIN_ROUTES } from "@/constants/admin-routes";

import type { MailAttachment, MailProvider } from "./mail.provider";
import { type ApplicationAlertInput, applicationAlertTemplate } from "./templates/application-alert";
import { type EnquiryAlertInput, enquiryAlertTemplate } from "./templates/enquiry-alert";
import { passwordResetTemplate } from "./templates/password-reset";

interface MailServiceOptions {
  provider: MailProvider;
  from: string;
  /** The site's address: where an email's links lead. */
  siteUrl: string;
}

/** Every email the site sends, one method each (plan §17); the words are MAIL_TEXT's. */
export class MailService {
  private readonly provider: MailProvider;
  private readonly from: string;
  private readonly siteUrl: string;

  constructor(options: MailServiceOptions) {
    this.provider = options.provider;
    this.from = options.from;
    this.siteUrl = options.siteUrl;
  }

  /** A new enquiry to the enquiries recipients, answered straight to the visitor (plan §10.4, §17). */
  async sendEnquiryAlert(
    input: Omit<EnquiryAlertInput, "siteUrl" | "inboxUrl"> & { id: string; to: readonly string[]; replyTo: string },
  ) {
    const { id, to, replyTo, ...alert } = input;
    const inboxUrl = new URL(ADMIN_ROUTES.enquiry(id), this.siteUrl).toString();
    const content = enquiryAlertTemplate({ ...alert, siteUrl: this.siteUrl, inboxUrl });
    await this.provider.send({ from: this.from, to: [...to], replyTo, ...content });
  }

  /**
   * A new application to the applications recipients, answered straight to
   * the applicant, with the CV attached when there is one (plan §9.3, §17).
   */
  async sendApplicationAlert(
    input: Omit<ApplicationAlertInput, "siteUrl" | "inboxUrl" | "cv"> & {
      id: string;
      to: readonly string[];
      replyTo: string;
      cv: { name: string; bytes: number };
      attachment: MailAttachment | null;
    },
  ) {
    const { id, to, replyTo, cv, attachment, ...alert } = input;
    const inboxUrl = new URL(ADMIN_ROUTES.application(id), this.siteUrl).toString();
    const content = applicationAlertTemplate({
      ...alert,
      cv: { ...cv, attachedAs: attachment?.filename ?? null },
      siteUrl: this.siteUrl,
      inboxUrl,
    });
    await this.provider.send({
      from: this.from,
      to: [...to],
      replyTo,
      ...content,
      ...(attachment ? { attachments: [attachment] } : {}),
    });
  }

  async sendPasswordReset(input: { to: string; name: string; resetUrl: string }) {
    const content = passwordResetTemplate({ ...input, siteUrl: this.siteUrl });
    await this.provider.send({ from: this.from, to: input.to, ...content });
  }
}
