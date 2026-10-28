import { describe, expect, it } from "vitest";

import { PASSWORD_RESET_MINUTES } from "@/constants/limits";
import { MAIL_TEXT } from "@/constants/messages";
import { passwordResetTemplate } from "@/lib/mail/templates/password-reset";

describe("passwordResetTemplate", () => {
  it("greets the admin, links the reset, and says how long it works", () => {
    const mail = passwordResetTemplate({
      siteUrl: "https://alhidaya.qa",
      name: "Admin",
      resetUrl: "https://alhidaya.qa/admin/reset?token=abc",
    });
    expect(mail.subject).toBe(MAIL_TEXT.passwordReset.subject);
    expect(mail.text).toContain("Hello Admin,");
    expect(mail.text).toContain("https://alhidaya.qa/admin/reset?token=abc");
    expect(mail.text).toContain(MAIL_TEXT.linkValid(PASSWORD_RESET_MINUTES));
    expect(mail.html).toContain(MAIL_TEXT.passwordReset.action);
  });
});
