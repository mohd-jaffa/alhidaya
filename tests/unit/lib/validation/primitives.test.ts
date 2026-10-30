import { describe, expect, it } from "vitest";
import * as z from "zod";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import {
  optionalEmail,
  optionalLine,
  optionalLines,
  optionalPhone,
  requiredEmail,
  requiredLine,
  requiredLines,
  requiredPhone,
} from "@/lib/validation";
import { botCheck, consent } from "@/lib/validation/primitives";

/** The first message a schema gives for a value, or the parsed value. */
function parse<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);
  return result.success ? { value: result.data } : { message: result.error.issues[0].message };
}

describe("required text", () => {
  const name = requiredLine("Full name", { min: 2, max: 10 });

  it("normalises before it checks", () => {
    expect(parse(name, "  Mariam​  Ali ")).toEqual({ value: "Mariam Ali" });
  });

  it("names each problem in the field's own words", () => {
    expect(parse(name, "   ")).toEqual({ message: VALIDATION_MESSAGES.required("Full name") });
    expect(parse(name, undefined)).toEqual({ message: VALIDATION_MESSAGES.required("Full name") });
    expect(parse(name, "M")).toEqual({ message: VALIDATION_MESSAGES.tooShort("Full name", 2) });
    expect(parse(name, "Mariam Al Thani")).toEqual({ message: VALIDATION_MESSAGES.tooLong("Full name", 10) });
  });

  it("keeps a message's line breaks", () => {
    expect(parse(requiredLines("Message", { max: 50 }), "Hello\r\n\r\n\r\nThanks ")).toEqual({
      value: "Hello\n\nThanks",
    });
  });
});

describe("optional text", () => {
  it("reads missing, blank and null as null", () => {
    for (const schema of [optionalLine("Organisation", 20), optionalLines("Note", 20)]) {
      expect(parse(schema, undefined)).toEqual({ value: null });
      expect(parse(schema, " ")).toEqual({ value: null });
      expect(parse(schema, null)).toEqual({ value: null });
    }
  });

  it("bounds what is given", () => {
    expect(parse(optionalLine("Organisation", 5), "Hamad Hospital")).toEqual({
      message: VALIDATION_MESSAGES.tooLong("Organisation", 5),
    });
    expect(parse(optionalLine("Organisation", 20), " Sidra ")).toEqual({ value: "Sidra" });
  });
});

describe("email", () => {
  it("stores a valid address in lower case and refuses anything else", () => {
    expect(parse(requiredEmail("Email"), " Info@AlHidaya.qa ")).toEqual({ value: "info@alhidaya.qa" });
    expect(parse(requiredEmail("Email"), "info@")).toEqual({ message: VALIDATION_MESSAGES.email("Email") });
    expect(parse(optionalEmail("Email"), "")).toEqual({ value: null });
    expect(parse(optionalEmail("Email"), "a b@c.d")).toEqual({ message: VALIDATION_MESSAGES.email("Email") });
    expect(parse(optionalEmail("Email"), "HR@alhidaya.qa")).toEqual({ value: "hr@alhidaya.qa" });
  });
});

describe("phone", () => {
  it("stores a number as E.164 and refuses anything else", () => {
    expect(parse(requiredPhone("Phone"), "3130 6555")).toEqual({ value: "+97431306555" });
    expect(parse(requiredPhone("Phone"), "12")).toEqual({ message: VALIDATION_MESSAGES.phone("Phone") });
    expect(parse(optionalPhone("Phone"), "")).toEqual({ value: null });
    expect(parse(optionalPhone("Phone"), "+44 7700 900123")).toEqual({ value: "+447700900123" });
  });
});

describe("a public form's consent and bot check", () => {
  it("takes only a ticked consent and a token Cloudflare gave", () => {
    expect(parse(consent, true)).toEqual({ value: true });
    expect(parse(consent, false)).toEqual({ message: VALIDATION_MESSAGES.consent });
    const token = botCheck.turnstileToken;
    expect(parse(token, "token")).toEqual({ value: "token" });
    expect(parse(token, "")).toEqual({ message: VALIDATION_MESSAGES.botCheck });
    expect(parse(token, undefined)).toEqual({ message: VALIDATION_MESSAGES.botCheck });
  });
});

describe("the wording floor", () => {
  it("never shows Zod's English for a check with no message of its own", () => {
    expect(parse(z.object({ count: z.number() }), { count: "x" })).toEqual({ message: VALIDATION_MESSAGES.invalid });
  });
});
