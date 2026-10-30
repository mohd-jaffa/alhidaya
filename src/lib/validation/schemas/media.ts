import * as z from "zod";

import { TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";

import { optionalLine } from "../primitives";

import { httpsUrlSchema } from "./content";

/**
 * An image's words (plan §15, D93): what it shows, required unless it is
 * marked decorative, and, for a stock photo, where it came from: three
 * optional parts, kept only when one is given.
 */
export const imageDetailsSchema = z
  .object({
    alt: optionalLine("Alt text", TEXT_LIMITS.alt),
    decorative: z.boolean(),
    source: z.object({
      provider: optionalLine("Source", TEXT_LIMITS.label),
      url: z.union([z.literal("").transform(() => null), httpsUrlSchema, z.null()]),
      licence: optionalLine("Licence", TEXT_LIMITS.label),
    }),
  })
  .superRefine((details, context) => {
    if (!details.decorative && !details.alt)
      context.addIssue({ code: "custom", message: VALIDATION_MESSAGES.required("Alt text"), path: ["alt"] });
  })
  .transform(({ alt, decorative, source }) => ({
    alt: decorative ? null : alt,
    decorative,
    source: source.provider || source.url || source.licence ? source : null,
  }));
export type ImageDetailsInput = z.input<typeof imageDetailsSchema>;
export type ImageDetailsPayload = z.output<typeof imageDetailsSchema>;

/** The image an upload carries (plan §15): its type and size are read from its bytes when it is stored. */
export const imageFileSchema = z.custom<File>((value) => value instanceof File, {
  error: VALIDATION_MESSAGES.required("The image"),
});
