import * as z from "zod";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { FONT_IDS, FONT_ROLES } from "@/constants/typography";

/** Complete, allowlisted role assignments. URLs, CSS, uploads and missing roles are refused. */
export const typographySchema = z.strictObject(
  {
    roles: z.record(z.enum(FONT_ROLES, VALIDATION_MESSAGES.invalid), z.enum(FONT_IDS, VALIDATION_MESSAGES.invalid), {
      error: VALIDATION_MESSAGES.invalid,
    }),
  },
  { error: VALIDATION_MESSAGES.invalid },
);
export type TypographyInput = z.input<typeof typographySchema>;
export type TypographyPayload = z.output<typeof typographySchema>;
