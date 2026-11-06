import type { CSSProperties } from "react";

import { FONT_ROLES, FONT_STACKS } from "@/constants/typography";
import type { TypographyPayload } from "@/lib/validation/schemas/typography";

/** Only trusted, fixed font stacks become CSS. No user-supplied font names or URLs. */
export function typographyStyle(document: TypographyPayload): CSSProperties {
  return Object.fromEntries(
    FONT_ROLES.map((role) => [`--type-${role}`, FONT_STACKS[document.roles[role]]]),
  ) as CSSProperties;
}
