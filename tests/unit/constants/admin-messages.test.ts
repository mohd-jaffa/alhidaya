import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";

describe("ADMIN_TEXT", () => {
  it("holds no empty wording, and says each count as it is", () => {
    for (const [key, value] of Object.entries(ADMIN_TEXT)) {
      const words = typeof value === "function" ? (value as (...args: unknown[]) => string)(2, 3) : value;
      expect(words.trim(), key).not.toBe("");
    }
    expect(ADMIN_TEXT.needsYouCount(1)).toBe("1 needs you");
    expect(ADMIN_TEXT.needsYouCount(4)).toBe("4 need you");
    expect(ADMIN_TEXT.quoteFrom("Omar")).toBe("Quote request from Omar");
  });
});
