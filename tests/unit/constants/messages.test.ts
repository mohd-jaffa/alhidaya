import { describe, expect, it } from "vitest";

import { UI_TEXT } from "@/constants/messages";

describe("UI_TEXT", () => {
  it("names the company as the user decided (plan D5)", () => {
    expect(UI_TEXT.siteName).toBe("Al Hidaya Health Care Services");
  });

  it("holds no empty wording", () => {
    for (const [key, value] of Object.entries(UI_TEXT)) {
      expect(value.trim(), key).not.toBe("");
    }
  });
});
