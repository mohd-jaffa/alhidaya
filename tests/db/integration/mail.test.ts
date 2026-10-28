import { afterAll, describe, expect, it } from "vitest";

import { createConfiguredMailService, NodemailerProvider } from "@/lib/mail/nodemailer.provider";

/**
 * The SMTP path end to end, against Mailpit (plan §17): what the site sends
 * arrives with its sender, its Reply-To and its attachment.
 */
const MAILPIT = process.env.MAILPIT_URL ?? "";
const SUBJECT = `Integration ${crypto.randomUUID()}`;

interface MailpitSummary {
  ID: string;
  Subject: string;
  From: { Address: string };
  ReplyTo: { Address: string }[];
  Attachments: number;
}

async function find(subject: string): Promise<MailpitSummary | undefined> {
  for (let tries = 0; tries < 20; tries++) {
    const response = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`subject:"${subject}"`)}`);
    const { messages } = (await response.json()) as { messages: MailpitSummary[] };
    if (messages.length > 0) return messages[0];
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return undefined;
}

afterAll(async () => {
  const found = await find(SUBJECT);
  if (found) await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE", body: JSON.stringify({ IDs: [found.ID] }) });
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

    const message = await find(SUBJECT);
    expect(message).toMatchObject({
      From: { Address: "noreply@alhidaya.qa" },
      ReplyTo: [{ Address: "applicant@example.com" }],
      Attachments: 1,
    });
  });
});
