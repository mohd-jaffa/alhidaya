import { describe, expect, it } from "vitest";

import {
  ERROR_MESSAGES,
  getErrorMessage,
  isErrorMessageCode,
  UI_TEXT,
  VALIDATION_MESSAGES,
} from "@/constants/messages";

describe("UI_TEXT", () => {
  it("names the company as the user decided (plan D5)", () => {
    expect(UI_TEXT.siteName).toBe("Al Hidaya Health Care Services");
  });

  it("holds no empty wording", () => {
    for (const [key, value] of Object.entries(UI_TEXT)) {
      const words = typeof value === "function" ? value("Retaj Building") : value;
      expect(words.trim(), key).not.toBe("");
    }
  });
});

describe("ERROR_MESSAGES", () => {
  it("holds no empty wording", () => {
    for (const [key, value] of Object.entries(ERROR_MESSAGES)) expect(value.trim(), key).not.toBe("");
  });

  it("knows its own codes and nothing else", () => {
    expect(isErrorMessageCode("CONFLICT")).toBe(true);
    expect(isErrorMessageCode("toString")).toBe(false);
    expect(isErrorMessageCode("NOPE")).toBe(false);
    expect(isErrorMessageCode(null)).toBe(false);
    expect(isErrorMessageCode(undefined)).toBe(false);
  });

  it("reads an unknown code as a failure of our own, never as its raw text", () => {
    expect(getErrorMessage("RATE_LIMITED")).toBe(ERROR_MESSAGES.RATE_LIMITED);
    expect(getErrorMessage("ER_DUP_ENTRY: Duplicate entry 'x' for key 'slug'")).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
  });
});

describe("VALIDATION_MESSAGES", () => {
  it("names the field in each problem", () => {
    expect(VALIDATION_MESSAGES.required("Email")).toBe("Email is required.");
    expect(VALIDATION_MESSAGES.tooShort("Name", 2)).toContain("at least 2");
    expect(VALIDATION_MESSAGES.tooLong("Name", 100)).toContain("at most 100");
    expect(VALIDATION_MESSAGES.email("Email")).toContain("name@example.com");
    expect(VALIDATION_MESSAGES.phone("Phone")).toContain("Qatar");
  });
});
