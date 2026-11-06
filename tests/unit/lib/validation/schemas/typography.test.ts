import { describe, expect, it } from "vitest";
import { DEFAULT_TYPOGRAPHY, FONT_IDS, FONT_ROLES } from "@/constants/typography";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { typographySchema } from "@/lib/validation/schemas/typography";

describe("typographySchema", () => {
  it("accepts every bundled font for every role, with a complete current-font default", () => {
    expect(FONT_IDS).toHaveLength(15);
    expect(FONT_ROLES).toHaveLength(20);
    expect(typographySchema.parse(DEFAULT_TYPOGRAPHY)).toEqual(DEFAULT_TYPOGRAPHY);
    for (const font of FONT_IDS)
      expect(
        typographySchema.parse({ roles: Object.fromEntries(FONT_ROLES.map((role) => [role, font])) }).roles.h1,
      ).toBe(font);
  });
  it("refuses incomplete assignments, unknown roles, CSS/URLs and extra controls with catalogue messages", () => {
    for (const input of [
      null,
      {},
      { roles: {} },
      { ...DEFAULT_TYPOGRAPHY, size: 200 },
      { roles: { ...DEFAULT_TYPOGRAPHY.roles, h1: "url(https://evil.example/font)" } },
      { roles: { ...DEFAULT_TYPOGRAPHY.roles, unexpected: "inter" } },
      { roles: { ...DEFAULT_TYPOGRAPHY.roles, input: null } },
    ]) {
      const parsed = typographySchema.safeParse(input);
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues.every((issue) => issue.message === VALIDATION_MESSAGES.invalid)).toBe(true);
    }
  });
});
