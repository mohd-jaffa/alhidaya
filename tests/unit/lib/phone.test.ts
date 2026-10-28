import { describe, expect, it } from "vitest";

import { callHref, formatPhone, toE164, whatsAppHref } from "@/lib/phone";

describe("toE164", () => {
  it("reads a Qatar number however it was typed", () => {
    for (const typed of ["31306555", "3130 6555", "+974 3130 6555", "00974 3130 6555", "(+974) 3130-6555"]) {
      expect(toE164(typed), typed).toBe("+97431306555");
    }
    expect(toE164("4444 1234")).toBe("+97444441234");
  });

  it("reads any other country's number when its code is given", () => {
    expect(toE164("+44 7700 900123")).toBe("+447700900123");
    expect(toE164("0091 98765 43210")).toBe("+919876543210");
  });

  it("refuses what cannot be a number", () => {
    for (const typed of [
      "",
      "123",
      "2130 6555",
      "3130 655",
      "+974 2130 6555",
      "+0 1234 5678",
      "+1234567890123456",
      "call me",
      "31306555x",
    ]) {
      expect(toE164(typed), typed).toBeNull();
    }
  });
});

describe("the number's other forms", () => {
  it("formats Qatar's in groups and leaves any other as stored", () => {
    expect(formatPhone("+97431306555")).toBe("+974 3130 6555");
    expect(formatPhone("+447700900123")).toBe("+447700900123");
    expect(formatPhone("+9741234")).toBe("+9741234");
  });

  it("dials and chats", () => {
    expect(callHref("+97431306555")).toBe("tel:+97431306555");
    expect(whatsAppHref("+97431306555")).toBe("https://wa.me/97431306555");
    expect(whatsAppHref("+97431306555", "Hello & welcome")).toBe(
      "https://wa.me/97431306555?text=Hello%20%26%20welcome",
    );
  });
});
