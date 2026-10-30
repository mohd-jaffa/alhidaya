import { describe, expect, it } from "vitest";

import { MAIL_TEXT } from "@/constants/messages";
import { applicationAlertTemplate } from "@/lib/mail/templates/application-alert";

const input = {
  siteUrl: "https://alhidaya.qa",
  name: "Mariam Ali",
  jobTitle: "Registered General Nurse – Home Care",
  receivedAt: new Date("2026-10-30T08:01:00Z"),
  fields: [
    { label: "Your MOPH licence", value: "In progress" },
    { label: "Anything else we should know", value: "ICU,\nfrom March." },
  ],
  cv: {
    name: "Mariam <CV>.pdf",
    bytes: 245_760,
    attachedAs: "2026-10-30_registered-general-nurse_mariam-ali_8f3a2c91d0.pdf",
  },
  inboxUrl: "https://alhidaya.qa/admin/applications/application-1",
};

describe("the application alert (plan §9.3)", () => {
  it("names the job, who applied and when in Doha, the CV attached, then every answer and the way to the inbox", () => {
    const alert = applicationAlertTemplate(input);
    expect(alert.subject).toBe("Application for Registered General Nurse – Home Care from Mariam Ali");
    expect(alert.text).toContain(
      "Mariam Ali applied for Registered General Nurse – Home Care on 30 October 2026 at 11:01, Doha time.",
    );
    expect(alert.text).toContain(MAIL_TEXT.applicationAlert.cvAttached(input.cv.attachedAs));
    expect(alert.text).toContain(`${MAIL_TEXT.applicationAlert.job}:\nRegistered General Nurse – Home Care`);
    expect(alert.text).toContain("Your MOPH licence:\nIn progress");
    expect(alert.text).toContain(`${MAIL_TEXT.applicationAlert.cv}:\nMariam <CV>.pdf · 240 kB`);
    expect(alert.text).toContain(`${MAIL_TEXT.applicationAlert.action}: ${input.inboxUrl}`);
    expect(alert.text).toContain(MAIL_TEXT.applicationAlert.footnote("Mariam Ali"));
    expect(alert.html).toContain("ICU,<br>from March.");
    expect(alert.html).toContain("Mariam &lt;CV&gt;.pdf");
    expect(alert.html).toContain(MAIL_TEXT.applicationAlert.heading(input.jobTitle));
  });

  it("names a general application as one, and says when the CV is not attached", () => {
    const alert = applicationAlertTemplate({ ...input, jobTitle: null, cv: { ...input.cv, attachedAs: null } });
    expect(alert.subject).toBe("General application from Mariam Ali");
    expect(alert.text).toContain("Mariam Ali sent a general application on 30 October 2026 at 11:01, Doha time.");
    expect(alert.text).toContain(MAIL_TEXT.applicationAlert.cvNotAttached);
    expect(alert.text).toContain(`${MAIL_TEXT.applicationAlert.job}:\n${MAIL_TEXT.applicationAlert.general}`);
    expect(alert.html).toContain(MAIL_TEXT.applicationAlert.heading(null));
  });
});
