import * as z from "zod";

import { TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { toE164 } from "@/lib/phone";
import { normaliseLine, normaliseLines } from "@/lib/text/normalise";

/**
 * The building blocks every form and route schema is made of (AGENTS.md §12).
 * Every message comes from VALIDATION_MESSAGES and names its field, so a
 * visitor sees one wording whichever side catches the mistake. The browser
 * checks for the visitor's sake; the server parses the same schema again; the
 * database's CHECKs are the last word.
 */

/**
 * The floor on wording: a check that names no message of its own gets the
 * catalogue's, never Zod's English. Set here because every schema is built
 * from these primitives, so it holds wherever one is parsed.
 */
z.config({ customError: () => VALIDATION_MESSAGES.invalid });

// A shape check, not a delivery check: something@something.something.
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A field that may be left out or blank, stored as null: missing, blank and
 * null are one thing to a form, so they are one thing here, and what a schema
 * produced can be parsed by it again. `tidy` normalises first.
 */
function optionalString(
  label: string,
  max: number,
  tidy: (text: string) => string,
  check?: { test: (value: string) => string | null; message: string },
) {
  return z.optional(z.union([z.string(), z.null()])).transform((text, ctx) => {
    let value: string | null = tidy(text ?? "");
    if (value === "") return null;
    if (value.length > max) {
      ctx.addIssue({ code: "custom", message: VALIDATION_MESSAGES.tooLong(label, max) });
      return z.NEVER;
    }
    if (check) {
      value = check.test(value);
      if (value === null) {
        ctx.addIssue({ code: "custom", message: check.message });
        return z.NEVER;
      }
    }
    return value;
  });
}

/**
 * Text a form must have, normalised and bounded, each problem in the field's
 * own words; a blank field is missing, not too short. `check` may also turn
 * the value into its stored shape (a phone number into E.164).
 */
function requiredString(
  label: string,
  { min, max }: { min: number; max: number },
  tidy: (text: string) => string,
  check?: { test: (value: string) => string | null; message: string },
) {
  return z.string({ error: VALIDATION_MESSAGES.required(label) }).transform((text, ctx) => {
    const value = tidy(text);
    const problem =
      value === ""
        ? VALIDATION_MESSAGES.required(label)
        : value.length < min
          ? VALIDATION_MESSAGES.tooShort(label, min)
          : value.length > max
            ? VALIDATION_MESSAGES.tooLong(label, max)
            : null;
    if (problem) {
      ctx.addIssue({ code: "custom", message: problem });
      return z.NEVER;
    }
    if (!check) return value;
    const shaped = check.test(value);
    if (shaped === null) {
      ctx.addIssue({ code: "custom", message: check.message });
      return z.NEVER;
    }
    return shaped;
  });
}

const emailCheck = (label: string) => ({
  test: (value: string) => (EMAIL.test(value) ? value.toLowerCase() : null),
  message: VALIDATION_MESSAGES.email(label),
});

const phoneCheck = (label: string) => ({ test: toE164, message: VALIDATION_MESSAGES.phone(label) });

/** One line a form must have: a name, a job title. */
export function requiredLine(label: string, { min = 1, max }: { min?: number; max: number }) {
  return requiredString(label, { min, max }, normaliseLine);
}

/** One line that may be left empty: an organisation; blank is null. */
export function optionalLine(label: string, max: number) {
  return optionalString(label, max, normaliseLine);
}

/** Several lines a form must have: a message. */
export function requiredLines(label: string, { min = 1, max }: { min?: number; max: number }) {
  return requiredString(label, { min, max }, normaliseLines);
}

/** Several lines that may be left empty: a note; blank is null. */
export function optionalLines(label: string, max: number) {
  return optionalString(label, max, normaliseLines);
}

/** An email address a form must have, stored in lower case. */
export function requiredEmail(label: string, max: number = TEXT_LIMITS.email) {
  return requiredString(label, { min: 1, max }, normaliseLine, emailCheck(label));
}

/** An email address that may be left empty; blank is null. */
export function optionalEmail(label: string, max: number = TEXT_LIMITS.email) {
  return optionalString(label, max, normaliseLine, emailCheck(label));
}

/** A phone number a form must have, stored as E.164 (src/lib/phone.ts). */
export function requiredPhone(label: string) {
  return requiredString(label, { min: 1, max: TEXT_LIMITS.phone }, normaliseLine, phoneCheck(label));
}

/** A phone number that may be left empty; blank is null. */
export function optionalPhone(label: string) {
  return optionalString(label, TEXT_LIMITS.phone, normaliseLine, phoneCheck(label));
}
