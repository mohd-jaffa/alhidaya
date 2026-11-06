import { expect, it } from "vitest";
import { DEFAULT_TYPOGRAPHY, FONT_IDS, FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import { typographyStyle } from "@/lib/typography/styles";

it("maps every role to its trusted stack without altering the input", () => {
  for (const font of FONT_IDS) {
    const config = { roles: { ...DEFAULT_TYPOGRAPHY.roles } };
    for (const role of FONT_ROLES) config.roles[role] = font;
    const styles = typographyStyle(config);
    for (const role of FONT_ROLES) expect(styles).toHaveProperty(`--type-${role}`, FONT_STACKS[font]);
  }
  expect(new Set(Object.values(DEFAULT_TYPOGRAPHY.roles))).toEqual(new Set(["inter-tight"]));
});
