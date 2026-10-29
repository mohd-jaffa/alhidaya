import { ADMIN_ROUTES } from "@/constants/routes";

import type { MailProvider } from "./mail.provider";
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

  async sendPasswordReset(input: { to: string; name: string; resetUrl: string }) {
    const content = passwordResetTemplate({ ...input, siteUrl: this.siteUrl });
    await this.provider.send({ from: this.from, to: input.to, ...content });
  }
}
