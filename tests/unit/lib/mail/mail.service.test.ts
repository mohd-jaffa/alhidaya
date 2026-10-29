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
