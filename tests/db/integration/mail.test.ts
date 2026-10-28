import { afterAll, describe, expect, it } from "vitest";

import { createConfiguredMailService, NodemailerProvider } from "@/lib/mail/nodemailer.provider";
import { deleteMail, searchMail, waitForMail } from "@tests/support/mailpit";

/**
 * The SMTP path end to end, against Mailpit (plan §17): what the site sends
 * arrives with its sender, its Reply-To and its attachment.
 */
const SUBJECT = `Integration ${crypto.randomUUID()}`;
const query = `subject:"${SUBJECT}"`;

afterAll(async () => {
  await deleteMail((await searchMail(query)).map((message) => message.ID));
});

describe("mail through SMTP", () => {
  it("sets up from the environment", () => {
    expect(createConfiguredMailService()).toBeDefined();
  });

  it("delivers a message with its Reply-To and attachment", async () => {
    const provider = new NodemailerProvider({
      host: process.env.SMTP_HOST ?? "",
      port: Number(process.env.SMTP_PORT),
      secure: false,
      requireTLS: false,
    });
    await provider.send({
      from: "Al Hidaya Health Care Services <noreply@alhidaya.qa>",
      to: "hr@alhidaya.qa",
      replyTo: "applicant@example.com",
      subject: SUBJECT,
      text: "A CV is attached.",
      html: "<p>A CV is attached.</p>",
      attachments: [
        { filename: "cv.pdf", content: new TextEncoder().encode("%PDF-1.4"), contentType: "application/pdf" },
      ],
    });

    const [message] = await waitForMail(query);
    expect(message).toMatchObject({
      From: { Address: "noreply@alhidaya.qa" },
      ReplyTo: [{ Address: "applicant@example.com" }],
      Attachments: 1,
    });
  });
});
