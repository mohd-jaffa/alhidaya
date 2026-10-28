import type { MailProvider } from "./mail.provider";
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

  async sendPasswordReset(input: { to: string; name: string; resetUrl: string }) {
    const content = passwordResetTemplate({ ...input, siteUrl: this.siteUrl });
    await this.provider.send({ from: this.from, to: input.to, ...content });
  }
}
