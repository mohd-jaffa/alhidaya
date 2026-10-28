import nodemailer, { type Transporter } from "nodemailer";

import { SITE } from "@/constants/site";
import { getServerEnv, type ServerEnv } from "@/lib/env/server";
import { externalServiceError } from "@/lib/errors";

import type { MailMessage, MailProvider } from "./mail.provider";
import { MailService } from "./mail.service";

interface NodemailerProviderOptions {
  host: string;
  port: number;
  secure: boolean;
  /** Refuse to send in the clear: on in production (plan §26). */
  requireTLS: boolean;
  user?: string;
  password?: string;
}

/** SMTP, through nodemailer: the server's cPanel mail in production, Mailpit locally. */
export class NodemailerProvider implements MailProvider {
  private readonly transporter: Transporter;

  constructor(options: NodemailerProviderOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      requireTLS: options.requireTLS,
      auth: options.user && options.password ? { user: options.user, pass: options.password } : undefined,
    });
  }

  async send(message: MailMessage) {
    await this.transporter.sendMail({
      ...message,
      attachments: message.attachments?.map((file) => ({
        filename: file.filename,
        content: Buffer.from(file.content),
        contentType: file.contentType,
      })),
    });
  }
}

/**
 * The site's mail, as the environment sets it up, sent from
 * `noreply@alhidaya.qa` (plan D53). With no SMTP host there is no mail, and
 * saying so is the answer: what it was for is never undone (plan §17).
 */
export function createConfiguredMailService(env: ServerEnv = getServerEnv()) {
  if (!env.SMTP_HOST) throw externalServiceError("MAIL_NOT_CONFIGURED");
  const secure = env.SMTP_SECURE ?? false;

  return new MailService({
    from: `${SITE.senderName} <${SITE.sender}>`,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    provider: new NodemailerProvider({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure,
      requireTLS: !secure && env.NODE_ENV === "production",
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
    }),
  });
}
