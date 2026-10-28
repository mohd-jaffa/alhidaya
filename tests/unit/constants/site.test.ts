import { describe, expect, it } from "vitest";

import { SITE } from "@/constants/site";

describe("SITE", () => {
  it("sends from noreply@ and routes to info@ and hr@ by default (plan D53, Q17)", () => {
    expect(SITE.sender).toBe("noreply@alhidaya.qa");
    expect(SITE.defaultRecipients).toEqual({ enquiries: "info@alhidaya.qa", applications: "hr@alhidaya.qa" });
    expect(SITE.url).toBe(`https://${SITE.domain}`);
  });
});
