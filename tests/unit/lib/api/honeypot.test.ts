import { describe, expect, it } from "vitest";

import { HONEYPOT_FIELD, honeypotFilled } from "@/lib/api/honeypot";

describe("the trap for bots", () => {
  it("is filled only by something other than empty", () => {
    expect(honeypotFilled({ [HONEYPOT_FIELD]: "https://spam.example" })).toBe(true);
    expect(honeypotFilled({ [HONEYPOT_FIELD]: 42 })).toBe(true);
    expect(honeypotFilled({ [HONEYPOT_FIELD]: "" })).toBe(false);
    expect(honeypotFilled({ [HONEYPOT_FIELD]: "   " })).toBe(false);
    expect(honeypotFilled({ name: "Mariam" })).toBe(false);
    expect(honeypotFilled(null)).toBe(false);
    expect(honeypotFilled("text")).toBe(false);
  });

  it("has a name no browser fills in for a person", () => {
    expect(HONEYPOT_FIELD).not.toMatch(/name|mail|phone|tel|url|web|site|company|address|fax/i);
  });
});
