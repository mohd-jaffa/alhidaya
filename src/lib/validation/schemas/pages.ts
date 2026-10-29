import * as z from "zod";

import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { FIXED_FIRST_SECTION, PAGE_RULES, type PageKey, type SectionType } from "@/constants/sections";
import { FORM_KINDS } from "@/constants/statuses";

import { optionalLine, optionalLines, requiredLine, requiredLines } from "../primitives";

import { imageRefSchema, localized, richTextSchema, seoSchema } from "./content";

const heading = localized(requiredLine("Heading", { max: TEXT_LIMITS.heading }));
const shortText = (label: string) => localized(optionalLines(label, TEXT_LIMITS.lede));

/** What each section type holds (plan §7.2). */
const SECTION_CONTENT = {
  SIGN: z.object({
    eyebrow: localized(optionalLine("Eyebrow", TEXT_LIMITS.label)),
    headline: localized(requiredLine("Headline", { max: TEXT_LIMITS.heading })),
    lede: shortText("Supporting line"),
    image: imageRefSchema.nullable(),
  }),
  INTRO: z.object({ heading, body: richTextSchema, image: imageRefSchema.nullable() }),
  SERVICES_INDEX: z.object({ heading, intro: shortText("Introduction") }),
  VALUES: z.object({
    heading,
    items: z
      .array(z.object({ title: localized(requiredLine("Title", { max: 80 })), text: shortText("Text") }))
      .min(1, VALIDATION_MESSAGES.atLeastOne("Values"))
      .max(LIST_LIMITS.values, VALIDATION_MESSAGES.atMost("Values", LIST_LIMITS.values)),
  }),
  MISSION: z.object({
    mission: localized(requiredLines("Mission", { max: 600 })),
    vision: localized(requiredLines("Vision", { max: 600 })),
  }),
  INSTITUTIONS: z.object({
    heading,
    text: localized(requiredLines("Text", { max: 600 })),
    image: imageRefSchema.nullable(),
  }),
  CLIENTS: z.object({ heading }),
  CAREERS_BAND: z.object({ heading, text: shortText("Text") }),
  JOBS_LIST: z.object({
    intro: localized(optionalLines("Introduction", 600)),
    emptyText: localized(requiredLines("When there are no jobs", { max: TEXT_LIMITS.lede })),
  }),
  CONTACT_BAND: z.object({ heading, text: shortText("Text") }),
  CONTACT_DETAILS: z.object({ heading }),
  FORM: z.object({ heading, text: shortText("Text"), form: z.enum(FORM_KINDS) }),
  RICH_TEXT: z.object({
    heading: localized(optionalLine("Heading", TEXT_LIMITS.heading)),
    body: richTextSchema.min(1, VALIDATION_MESSAGES.atLeastOne("The text")),
  }),
} satisfies Record<SectionType, z.ZodType>;

const sectionOf = <T extends SectionType>(type: T) =>
  z.object({ id: z.uuid(), type: z.literal(type), visible: z.boolean(), content: SECTION_CONTENT[type] });

export const sectionSchema = z.discriminatedUnion("type", [
  sectionOf("SIGN"),
  sectionOf("INTRO"),
  sectionOf("SERVICES_INDEX"),
  sectionOf("VALUES"),
  sectionOf("MISSION"),
  sectionOf("INSTITUTIONS"),
  sectionOf("CLIENTS"),
  sectionOf("CAREERS_BAND"),
  sectionOf("JOBS_LIST"),
  sectionOf("CONTACT_BAND"),
  sectionOf("CONTACT_DETAILS"),
  sectionOf("FORM"),
  sectionOf("RICH_TEXT"),
]);
export type Section = z.output<typeof sectionSchema>;

const pageShape = z.object({
  seo: seoSchema,
  sections: z.array(sectionSchema).min(1).max(LIST_LIMITS.sections),
});
export type PageDocument = z.output<typeof pageShape>;

/**
 * A page as one document (plan D58), held to its page's rules (plan §7.1): the
 * sign first and visible, only the types the page allows, at most as many of
 * each as allowed, what it cannot work without present and visible, and no
 * section twice.
 */
export function pageDocumentSchema(page: PageKey) {
  const rule = PAGE_RULES[page];
  return pageShape.superRefine(({ sections }, context) => {
    const issue = (message: string) => context.addIssue({ code: "custom", message, path: ["sections"] });
    const [first, ...rest] = sections;
    if (
      first.type !== FIXED_FIRST_SECTION ||
      !first.visible ||
      rest.some((section) => section.type === FIXED_FIRST_SECTION)
    ) {
      issue(VALIDATION_MESSAGES.signFirst);
    }
    const counts = new Map<SectionType, number>();
    for (const section of sections) counts.set(section.type, (counts.get(section.type) ?? 0) + 1);
    for (const [type, count] of counts) {
      if (!rule.allowed.includes(type)) issue(VALIDATION_MESSAGES.sectionNotAllowed(type));
      else if (count > (rule.max?.[type] ?? 1)) issue(VALIDATION_MESSAGES.sectionLimit(type, rule.max?.[type] ?? 1));
    }
    for (const type of rule.required ?? []) {
      if (!sections.some((section) => section.type === type && section.visible))
        issue(VALIDATION_MESSAGES.sectionRequired(type));
    }
    if (new Set(sections.map((section) => section.id)).size !== sections.length) {
      issue(VALIDATION_MESSAGES.noRepeats("A page"));
    }
  });
}
