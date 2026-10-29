import { describe, expect, it } from "vitest";

import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { contactFormSchema, enquirySchema, quoteFormSchema } from "@/lib/validation";

const contact = {
  name: "  Mariam   Ali ",
  phone: "5551 2345",
  email: "Mariam@Example.com",
  message: "Do you have a nurse\r\nfor my father at night?",
  consent: true,
  turnstileToken: "token-from-cloudflare",
};

const quote = {
  name: "Omar Haddad",
  organisation: "",
  careFor: "SCHOOL",
  service: "school-nurse-staffing",
  phone: "+44 20 7946 0958",
  email: "omar@example.com",
  contactMethod: "EMAIL",
  message: "Two school nurses from January.",
  consent: true,
  turnstileToken: "token-from-cloudflare",
};

/** The first problem with each field, as the form shows it. */
const problems = (result: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]));

describe("the Contact form (plan §10.2)", () => {
  it("tidies what was typed: one line, a lower-case email, a Qatar number in E.164", () => {
    expect(contactFormSchema.parse(contact)).toEqual({
      name: "Mariam Ali",
      phone: "+97455512345",
      email: "mariam@example.com",
      message: "Do you have a nurse\nfor my father at night?",
      consent: true,
      turnstileToken: "token-from-cloudflare",
    });
  });

  it("names each field in its problem, in the catalogue's words", () => {
    expect(problems(contactFormSchema.safeParse({ consent: false }))).toEqual({
      name: VALIDATION_MESSAGES.required(UI_TEXT.yourName),
      phone: VALIDATION_MESSAGES.required(UI_TEXT.phone),
      email: VALIDATION_MESSAGES.required(UI_TEXT.email),
      message: VALIDATION_MESSAGES.required(UI_TEXT.message),
      consent: VALIDATION_MESSAGES.consent,
      turnstileToken: VALIDATION_MESSAGES.botCheck,
    });
    expect(
      problems(contactFormSchema.safeParse({ ...contact, phone: "12", email: "mariam", message: "x".repeat(2001) })),
    ).toEqual({
      phone: VALIDATION_MESSAGES.phone(UI_TEXT.phone),
      email: VALIDATION_MESSAGES.email(UI_TEXT.email),
      message: VALIDATION_MESSAGES.tooLong(UI_TEXT.message, 2000),
    });
  });
});

describe("the Quote form (plan §10.1)", () => {
  it("leaves the organisation and the service out when they are left empty", () => {
    expect(quoteFormSchema.parse({ ...quote, service: "" })).toMatchObject({
      organisation: null,
      service: null,
      careFor: "SCHOOL",
      contactMethod: "EMAIL",
      phone: "+442079460958",
    });
  });

  it("asks for a choice of who the care is for and how to reach the visitor", () => {
    expect(problems(quoteFormSchema.safeParse({ ...quote, careFor: undefined, contactMethod: "FAX" }))).toEqual({
      careFor: VALIDATION_MESSAGES.careFor,
      contactMethod: VALIDATION_MESSAGES.contactMethod,
    });
  });
});

describe("Turnstile's token (plan §10.3)", () => {
  it("is needed by both forms, and bounded as Cloudflare bounds it", () => {
    for (const schema of [contactFormSchema, quoteFormSchema]) {
      const form = schema === contactFormSchema ? contact : quote;
      expect(problems(schema.safeParse({ ...form, turnstileToken: "" }))).toEqual({
        turnstileToken: VALIDATION_MESSAGES.botCheck,
      });
      expect(schema.safeParse({ ...form, turnstileToken: "x".repeat(2049) }).success).toBe(false);
    }
  });
});

describe("what the enquiries route accepts", () => {
  it("reads either form by its kind, and nothing else", () => {
    expect(enquirySchema.parse({ ...contact, form: "CONTACT" }).form).toBe("CONTACT");
    expect(enquirySchema.parse({ ...quote, form: "QUOTE" })).toMatchObject({ form: "QUOTE", careFor: "SCHOOL" });
    expect(enquirySchema.safeParse({ ...quote, form: "CONTACT" }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...contact, form: "QUOTE" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...contact, form: "APPLICATION" }).success).toBe(false);
  });
});
