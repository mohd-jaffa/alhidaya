import * as z from "zod";

import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";

import { optionalLine, optionalLines, requiredLine, requiredLines } from "../primitives";

/**
 * The building blocks every content document is made of (plan §7, D58). Text
 * is kept per language (`{ en }`), so Arabic arrives as data, not a migration
 * (plan §33, Q21). No HTML is ever stored: rich text is a list of blocks.
 */
export const localized = <T extends z.ZodType>(schema: T) => z.object({ en: schema });

const INTERNAL_PATH = /^\/(?!\/)[A-Za-z0-9\-._~/?#=&%]*$/;

/** A link may lead to a page of this site, or to an https address with no credentials in it. */
export function isSafeHref(value: string): boolean {
  if (INTERNAL_PATH.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

export const hrefSchema = z
  .string()
  .trim()
  .max(TEXT_LIMITS.url, VALIDATION_MESSAGES.link)
  .refine(isSafeHref, VALIDATION_MESSAGES.link);

/** An https address only: a map, a social profile, a client's site. */
export const httpsUrlSchema = hrefSchema.refine((value) => value.startsWith("https://"), VALIDATION_MESSAGES.link);

export const slugSchema = z
  .string()
  .trim()
  .max(TEXT_LIMITS.slug, VALIDATION_MESSAGES.slug)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, VALIDATION_MESSAGES.slug);

/** True for a day that exists: "2026-02-28", never "2026-02-30". */
function isCalendarDay(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** A calendar day, "2026-10-28". */
export const isoDateSchema = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, VALIDATION_MESSAGES.date(label))
    .refine(isCalendarDay, VALIDATION_MESSAGES.date(label));

/** An image from the media library, by id. */
export const imageRefSchema = z.object({ mediaId: z.uuid() });

const richBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: localized(requiredLine("Heading", { max: TEXT_LIMITS.heading })) }),
  z.object({
    type: z.literal("paragraph"),
    text: localized(requiredLines("Paragraph", { max: TEXT_LIMITS.paragraph })),
  }),
  z.object({
    type: z.literal("list"),
    items: z
      .array(localized(requiredLine("List item", { max: TEXT_LIMITS.item })))
      .min(1, VALIDATION_MESSAGES.atLeastOne("A list"))
      .max(LIST_LIMITS.jobPoints, VALIDATION_MESSAGES.atMost("A list", LIST_LIMITS.jobPoints)),
  }),
  z.object({
    type: z.literal("link"),
    label: localized(requiredLine("Link text", { max: TEXT_LIMITS.label })),
    href: hrefSchema,
  }),
]);

/** Headings, paragraphs, lists and links (plan §7.2): never raw HTML. */
export const richTextSchema = z
  .array(richBlockSchema)
  .max(LIST_LIMITS.richBlocks, VALIDATION_MESSAGES.atMost("The text", LIST_LIMITS.richBlocks));
export type RichText = z.output<typeof richTextSchema>;

export const seoSchema = z.object({
  title: localized(optionalLine("SEO title", TEXT_LIMITS.seoTitle)),
  description: localized(optionalLines("SEO description", TEXT_LIMITS.seoDescription)),
});

/** A list with no repeats, by a key. */
export const withoutRepeats =
  <T>(label: string, keyOf: (item: T) => string) =>
  (items: T[], context: z.RefinementCtx) => {
    const keys = items.map(keyOf);
    if (new Set(keys).size !== keys.length)
      context.addIssue({ code: "custom", message: VALIDATION_MESSAGES.noRepeats(label) });
  };
