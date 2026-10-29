import { describe, expect, it } from "vitest";

import { MAIL_TEXT } from "@/constants/messages";
import { enquiryAlertTemplate } from "@/lib/mail/templates/enquiry-alert";

const input = {
  siteUrl: "https://alhidaya.qa",
  name: "Omar Haddad",
  receivedAt: new Date("2026-10-29T08:01:00Z"),
  fields: [
    { label: "Who is the care for?", value: "A school" },
    { label: "Message", value: "Two school nurses\nfrom January." },
  ],
  inboxUrl: "https://alhidaya.qa/admin/enquiries/enquiry-1",
};

describe("the enquiry alert (plan §10.4)", () => {
  it("names the form, who sent it and when in Doha, then every answer and the way to the inbox", () => {
    const quote = enquiryAlertTemplate({ ...input, form: "QUOTE" });
    expect(quote.subject).toBe("New quote request from Omar Haddad");
    expect(quote.text).toContain(
      "Omar Haddad sent this through the Request a Quote form on 29 October 2026 at 11:01, Doha time.",
    );
    expect(quote.text).toContain("Who is the care for?\nA school");
    expect(quote.text).toContain(`${MAIL_TEXT.enquiryAlert.action}: ${input.inboxUrl}`);
    expect(quote.text).toContain(MAIL_TEXT.enquiryAlert.footnote("Omar Haddad"));
    expect(quote.html).toContain("Two school nurses<br>from January.");
    expect(quote.html).toContain(MAIL_TEXT.enquiryAlert.QUOTE.heading);

    const contact = enquiryAlertTemplate({ ...input, form: "CONTACT" });
    expect(contact.subject).toBe("New message from Omar Haddad");
    expect(contact.text).toContain("through the Contact form");
  });
});
