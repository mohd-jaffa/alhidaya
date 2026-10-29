import { describe, expect, it } from "vitest";

import { DOCUMENT_KEYS, PAGE_KEYS, PAGE_RULES, SECTION_TYPES } from "@/constants/sections";

describe("the page rules", () => {
  it("let every page open with its sign, and require only what it allows", () => {
    for (const page of PAGE_KEYS) {
      const rule = PAGE_RULES[page];
      expect(rule.allowed[0]).toBe("SIGN");
      for (const type of [...rule.allowed, ...(rule.required ?? []), ...Object.keys(rule.max ?? {})]) {
        expect(SECTION_TYPES).toContain(type);
        expect(rule.allowed).toContain(type);
      }
    }
  });

  it("name a document for each page, the site and each ordering", () => {
    expect(DOCUMENT_KEYS).toEqual([
      ...PAGE_KEYS.map((page) => `PAGE:${page}`),
      "SITE",
      "ORDER:SERVICES",
      "ORDER:CLIENTS",
    ]);
    expect(Math.max(...DOCUMENT_KEYS.map((key) => key.length))).toBeLessThanOrEqual(32);
  });
});
