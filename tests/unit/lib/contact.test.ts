import { describe, expect, it } from "vitest";

import { displayPhone, mailtoHref, telHref, whatsappHref } from "@/lib/contact";

describe("the contact links", () => {
  it("open a WhatsApp chat with its first line written, by number without the plus", () => {
    expect(whatsappHref("+97431306555", "Hello Al Hidaya, I would like to ask about nursing care.")).toBe(
      "https://wa.me/97431306555?text=Hello%20Al%20Hidaya%2C%20I%20would%20like%20to%20ask%20about%20nursing%20care.",
    );
  });

  it("open a chat with a visitor by their number, with nothing written", () => {
    expect(whatsappHref("+97455512345")).toBe("https://wa.me/97455512345");
  });

  it("call and email", () => {
    expect(telHref("+97431306555")).toBe("tel:+97431306555");
    expect(mailtoHref("info@alhidaya.qa")).toBe("mailto:info@alhidaya.qa");
  });

  it("read a Qatar number in its groups, and leave any other as stored", () => {
    expect(displayPhone("+97431306555")).toBe("+974 3130 6555");
    expect(displayPhone("+447700900123")).toBe("+447700900123");
  });
});
