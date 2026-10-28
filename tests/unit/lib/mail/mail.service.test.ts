import { describe, expect, it, vi } from "vitest";

import { MAIL_TEXT } from "@/constants/messages";
import type { MailMessage } from "@/lib/mail/mail.provider";
import { MailService } from "@/lib/mail/mail.service";

describe("MailService", () => {
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
