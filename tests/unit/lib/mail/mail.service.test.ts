import { describe, expect, it, vi } from "vitest";

import { MAIL_TEXT } from "@/constants/messages";
import type { MailMessage } from "@/lib/mail/mail.provider";
import { MailService } from "@/lib/mail/mail.service";

describe("MailService", () => {
  it("sends an enquiry's alert to every recipient, answered straight to the visitor, with the way to the inbox", async () => {
    const send = vi.fn(async (message: MailMessage) => void message);
    const service = new MailService({
      provider: { send },
      from: "Site <noreply@alhidaya.qa>",
      siteUrl: "https://x.qa",
    });
    await service.sendEnquiryAlert({
      id: "enquiry-1",
      to: ["info@alhidaya.qa", "care@alhidaya.qa"],
      replyTo: "mariam@example.com",
      form: "CONTACT",
      name: "Mariam Ali",
      receivedAt: new Date("2026-10-29T08:01:00Z"),
      fields: [{ label: "Message", value: "A nurse at night?" }],
    });
    const [message] = send.mock.calls[0];
    expect(message).toMatchObject({
      from: "Site <noreply@alhidaya.qa>",
      to: ["info@alhidaya.qa", "care@alhidaya.qa"],
      replyTo: "mariam@example.com",
      subject: MAIL_TEXT.enquiryAlert.CONTACT.subject("Mariam Ali"),
    });
    expect(message.text).toContain("https://x.qa/admin/enquiries/enquiry-1");
  });

  it("sends an application's alert to every recipient, answered straight to the applicant, with its CV attached", async () => {
    const send = vi.fn(async (message: MailMessage) => void message);
    const service = new MailService({
      provider: { send },
      from: "Site <noreply@alhidaya.qa>",
      siteUrl: "https://x.qa",
    });
    const alert = {
      id: "application-1",
      to: ["hr@alhidaya.qa"],
      replyTo: "mariam@example.com",
      name: "Mariam Ali",
      jobTitle: null,
      receivedAt: new Date("2026-10-30T08:01:00Z"),
      fields: [{ label: "Prometric exam", value: "Passed" }],
      cv: { name: "cv.pdf", bytes: 12 },
    };
    const attachment = {
      filename: "2026-10-30_general_mariam-ali_8f3a2c91d0.pdf",
      content: new Uint8Array([37]),
      contentType: "application/pdf",
    };
    await service.sendApplicationAlert({ ...alert, attachment });
    const [message] = send.mock.calls[0];
    expect(message).toMatchObject({
      from: "Site <noreply@alhidaya.qa>",
      to: ["hr@alhidaya.qa"],
      replyTo: "mariam@example.com",
      subject: MAIL_TEXT.applicationAlert.subject("Mariam Ali", null),
      attachments: [attachment],
    });
    expect(message.text).toContain("https://x.qa/admin/applications/application-1");
    expect(message.text).toContain(MAIL_TEXT.applicationAlert.cvAttached(attachment.filename));

    await service.sendApplicationAlert({ ...alert, attachment: null });
    const [bare] = send.mock.calls[1];
    expect(bare.attachments).toBeUndefined();
    expect(bare.text).toContain(MAIL_TEXT.applicationAlert.cvNotAttached);
  });

  it("sends the password reset from the site's sender", async () => {
    const send = vi.fn(async (message: MailMessage) => void message);
    const service = new MailService({
      provider: { send },
      from: "Site <noreply@alhidaya.qa>",
      siteUrl: "https://x.qa",
    });
    await service.sendPasswordReset({ to: "admin@alhidaya.qa", name: "Admin", resetUrl: "https://x.qa/r" });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Site <noreply@alhidaya.qa>",
        to: "admin@alhidaya.qa",
        subject: MAIL_TEXT.passwordReset.subject,
      }),
    );
  });
});
