import * as z from "zod";

import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { SECTION_NAMES } from "@/constants/admin-messages";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import {
  FIXED_FIRST_SECTION,
  PAGE_RULES,
  type PageKey,
  SECTION_PICTOGRAMS,
  type SectionType,
} from "@/constants/sections";
import { SECTION_FORMS } from "@/constants/statuses";

import { optionalLine, optionalLines, requiredLine, requiredLines } from "../primitives";

import { hrefSchema, imageRefSchema, localized, richTextSchema, seoSchema } from "./content";

const heading = localized(requiredLine("Heading", { max: TEXT_LIMITS.heading }));
const shortText = (label: string) => localized(optionalLines(label, TEXT_LIMITS.lede));

const chipIcon = z.enum(SECTION_PICTOGRAMS).nullable();
const optionalLabel = (name: string) => localized(optionalLine(name, TEXT_LIMITS.label));

/**
 * One of Home's slides (D128): its photo, its headline with a phrase in blue,
 * its line, and a button only when the admin gives it both words and a link.
 */
const slide = z
  .object({
    image: imageRefSchema.nullable(),
    headline: localized(requiredLine("Headline", { max: TEXT_LIMITS.heading })),
    highlight: localized(optionalLine("Highlighted words", TEXT_LIMITS.heading)),
    text: shortText("Text"),
    buttonLabel: optionalLabel("Button wording"),
    buttonHref: localized(
      z
        .union([hrefSchema, z.literal("")])
        .nullable()
        .transform((value) => value || null),
    ),
  })
  .refine((value) => Boolean(value.buttonLabel.en) === Boolean(value.buttonHref.en), {
    message: VALIDATION_MESSAGES.buttonNeedsBoth,
    path: ["buttonHref"],
  });

/** Home's hero left empty: what every other page's sign holds in its place. */
export const NO_HERO = { slides: [], note: { pictogram: null, text: { en: null } } };

/** What each section type holds (plan §7.2). */
const SECTION_CONTENT = {
  SIGN: z.object({
    headline: localized(requiredLine("Headline", { max: TEXT_LIMITS.heading })),
    lede: shortText("Supporting line"),
    image: imageRefSchema.nullable(),
    // Words of the headline set apart, on any page's sign (D97, D109).
    highlight: localized(optionalLine("Highlighted words", TEXT_LIMITS.heading)).default({ en: null }),
    // Home's hero only (D128): the slides, and the card on the photo.
    slides: z
      .array(slide)
      .max(LIST_LIMITS.slides, VALIDATION_MESSAGES.atMost("Slides", LIST_LIMITS.slides))
      .default(NO_HERO.slides),
    note: z.object({ pictogram: chipIcon, text: optionalLabel("Note") }).default(NO_HERO.note),
  }),
  // About on Home (D129): its heading with a phrase in blue, its words, and points beneath them.
  INTRO: z.object({
    heading,
    highlight: localized(optionalLine("Highlighted words", TEXT_LIMITS.heading)).default({ en: null }),
    body: richTextSchema,
    image: imageRefSchema.nullable(),
    points: z
      .array(
        z.object({ title: localized(requiredLine("Title", { max: TEXT_LIMITS.valueTitle })), text: shortText("Text") }),
      )
      .max(LIST_LIMITS.values, VALIDATION_MESSAGES.atMost("Points", LIST_LIMITS.values))
      .default([]),
  }),
  SERVICES_INDEX: z.object({ heading, intro: shortText("Introduction") }),
  VALUES: z.object({
    heading,
    items: z
      .array(
        z.object({ title: localized(requiredLine("Title", { max: TEXT_LIMITS.valueTitle })), text: shortText("Text") }),
      )
      .min(1, VALIDATION_MESSAGES.atLeastOne("Values"))
      .max(LIST_LIMITS.values, VALIDATION_MESSAGES.atMost("Values", LIST_LIMITS.values)),
  }),
  MISSION: z.object({
    mission: localized(requiredLines("Mission", { max: TEXT_LIMITS.sectionText })),
    vision: localized(requiredLines("Vision", { max: TEXT_LIMITS.sectionText })),
  }),
  INSTITUTIONS: z.object({
    heading,
    text: localized(requiredLines("Text", { max: TEXT_LIMITS.sectionText })),
    image: imageRefSchema.nullable(),
  }),
  CLIENTS: z.object({ heading }),
  CAREERS_BAND: z.object({ heading, text: shortText("Text") }),
  JOBS_LIST: z.object({
    intro: localized(optionalLines("Introduction", TEXT_LIMITS.sectionText)),
    emptyText: localized(requiredLines("When there are no jobs", { max: TEXT_LIMITS.lede })),
  }),
  CONTACT_BAND: z.object({ heading, text: shortText("Text") }),
  CONTACT_DETAILS: z.object({ heading }),
  FORM: z.object({ heading, text: shortText("Text"), form: z.enum(SECTION_FORMS) }),
  RICH_TEXT: z.object({
    heading: localized(optionalLine("Heading", TEXT_LIMITS.heading)),
    body: richTextSchema.min(1, VALIDATION_MESSAGES.atLeastOne("The text")),
  }),
  // Every published service as a card in a row to scroll, under its heading (D131).
  SERVICES_ROW: z.object({ heading, text: shortText("Text") }),
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
  sectionOf("SERVICES_ROW"),
]);
export type Section = z.output<typeof sectionSchema>;
export type SectionInput = z.input<typeof sectionSchema>;

const pageShape = z.object({
  seo: seoSchema,
  sections: z.array(sectionSchema).min(1).max(LIST_LIMITS.sections),
});
export type PageDocument = z.output<typeof pageShape>;
/** A page as the admin's editor holds it, before its text is tidied (AGENTS.md §12). */
export type PageDocumentInput = z.input<typeof pageShape>;

/**
 * A page as one document (plan D58), held to its page's rules (plan §7.1): the
 * sign first and visible, only the types the page allows, at most as many of
 * each as allowed, what it cannot work without present and visible, no
 * section twice, and Home's hero with a slide.
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
    // Home's hero is its slides (D128): it shows at least one.
    if (page === "HOME" && first.type === "SIGN" && first.content.slides.length === 0) {
      context.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.atLeastOne("Slides"),
        path: ["sections", 0, "content", "slides"],
      });
    }
    const counts = new Map<SectionType, number>();
    for (const section of sections) counts.set(section.type, (counts.get(section.type) ?? 0) + 1);
    for (const [type, count] of counts) {
      if (!rule.allowed.includes(type)) issue(VALIDATION_MESSAGES.sectionNotAllowed(SECTION_NAMES[type]));
      else if (count > (rule.max?.[type] ?? 1))
        issue(VALIDATION_MESSAGES.sectionLimit(SECTION_NAMES[type], rule.max?.[type] ?? 1));
    }
    for (const type of rule.required ?? []) {
      if (!sections.some((section) => section.type === type && section.visible))
        issue(VALIDATION_MESSAGES.sectionRequired(SECTION_NAMES[type]));
    }
    if (new Set(sections.map((section) => section.id)).size !== sections.length) {
      issue(VALIDATION_MESSAGES.noRepeats("A page"));
    }
  });
}
