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
import { FORM_KINDS } from "@/constants/statuses";

import { optionalLine, optionalLines, requiredLine, requiredLines } from "../primitives";

import { imageRefSchema, localized, richTextSchema, seoSchema } from "./content";

const heading = localized(requiredLine("Heading", { max: TEXT_LIMITS.heading }));
const shortText = (label: string) => localized(optionalLines(label, TEXT_LIMITS.lede));

/* The redesign's parts (D97, D100): faces in a group, an icon beside words, a real fact (D99), a titled photo. */
const faces = (max: number) => z.array(imageRefSchema).max(max, VALIDATION_MESSAGES.atMost("Faces", max));
const chipIcon = z.enum(SECTION_PICTOGRAMS).nullable();
const label = (name: string) => localized(requiredLine(name, { max: TEXT_LIMITS.label }));
const optionalLabel = (name: string) => localized(optionalLine(name, TEXT_LIMITS.label));
const fact = z.object({
  value: localized(requiredLine("Figure", { max: TEXT_LIMITS.figure })),
  label: label("What the figure counts"),
});
const pictured = z.object({ image: imageRefSchema.nullable(), text: shortText("Words on the photo") });
/** Home's hero left empty (D97): what every other page's sign holds in its place. */
export const NO_HERO = {
  highlight: { en: null },
  avatars: [],
  chips: [],
  card: { title: { en: null }, tag: { en: null }, image: null },
  note: { pictogram: null, text: { en: null } },
  fact: { value: { en: null }, label: { en: null } },
};

/** An audience's opening (D97): its pill, then its heading with an icon set between two parts. */
const opening = {
  label: localized(requiredLine("Label", { max: TEXT_LIMITS.chip })),
  headingStart: localized(requiredLine("Heading", { max: TEXT_LIMITS.heading })),
  pictogram: chipIcon,
  headingEnd: localized(optionalLine("Heading, after the icon", TEXT_LIMITS.heading)),
};

/** What each section type holds (plan §7.2). */
const SECTION_CONTENT = {
  SIGN: z.object({
    headline: localized(requiredLine("Headline", { max: TEXT_LIMITS.heading })),
    lede: shortText("Supporting line"),
    image: imageRefSchema.nullable(),
    // Home's hero only (D97): the words on a highlight, faces, chips over the photo, its two cards and a fact.
    highlight: localized(optionalLine("Highlighted words", TEXT_LIMITS.heading)).default(NO_HERO.highlight),
    avatars: faces(LIST_LIMITS.avatars).default(NO_HERO.avatars),
    chips: z
      .array(localized(requiredLine("Chip", { max: TEXT_LIMITS.chip })))
      .max(LIST_LIMITS.chips, VALIDATION_MESSAGES.atMost("Chips", LIST_LIMITS.chips))
      .default(NO_HERO.chips),
    card: z
      .object({ title: optionalLabel("Card"), tag: optionalLabel("Card's tag"), image: imageRefSchema.nullable() })
      .default(NO_HERO.card),
    note: z.object({ pictogram: chipIcon, text: optionalLabel("Note") }).default(NO_HERO.note),
    fact: z
      .object({
        value: localized(optionalLine("Figure", TEXT_LIMITS.figure)),
        label: optionalLabel("What the figure counts"),
      })
      .default(NO_HERO.fact),
  }),
  INTRO: z.object({ heading, body: richTextSchema, image: imageRefSchema.nullable() }),
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
  FORM: z.object({ heading, text: shortText("Text"), form: z.enum(FORM_KINDS) }),
  RICH_TEXT: z.object({
    heading: localized(optionalLine("Heading", TEXT_LIMITS.heading)),
    body: richTextSchema.min(1, VALIDATION_MESSAGES.atLeastOne("The text")),
  }),
  STATEMENT: z.object({
    parts: z
      .array(
        z.object({
          text: localized(requiredLine("Words", { max: TEXT_LIMITS.line })),
          strong: z.boolean(),
          pictogram: chipIcon,
        }),
      )
      .min(1, VALIDATION_MESSAGES.atLeastOne("The statement"))
      .max(LIST_LIMITS.statementParts, VALIDATION_MESSAGES.atMost("The statement", LIST_LIMITS.statementParts)),
  }),
  HIGHLIGHTS: z.object({
    note: z.object({ pictogram: chipIcon, title: label("Title"), text: shortText("Text") }),
    first: z.object({ image: imageRefSchema.nullable(), label: optionalLabel("Words on the photo") }),
    accent: z.object({
      title: label("Title"),
      text: shortText("Text"),
      avatars: faces(4),
      fact: z.object({
        value: localized(optionalLine("Figure", TEXT_LIMITS.figure)),
        label: optionalLabel("What the figure counts"),
      }),
    }),
    second: z.object({ image: imageRefSchema.nullable(), label: optionalLabel("Words on the photo") }),
  }),
  FOR_INSTITUTIONS: z.object({
    ...opening,
    team: z.object({ title: label("Title"), text: shortText("Text"), avatars: faces(LIST_LIMITS.avatars) }),
    photo: pictured,
    reach: z.object({ title: label("Title"), avatars: faces(4) }),
    facts: z.array(fact).max(LIST_LIMITS.facts, VALIDATION_MESSAGES.atMost("Figures", LIST_LIMITS.facts)),
  }),
  FOR_FAMILIES: z.object({
    ...opening,
    photo: pictured,
    features: z
      .array(z.object({ pictogram: chipIcon, title: label("Title") }))
      .max(LIST_LIMITS.features, VALIDATION_MESSAGES.atMost("Features", LIST_LIMITS.features)),
  }),
  PROCESS: z.object({
    ...opening,
    steps: z
      .array(
        z.object({
          image: imageRefSchema.nullable(),
          title: localized(requiredLine("Step", { max: TEXT_LIMITS.valueTitle })),
          text: shortText("Text"),
        }),
      )
      .min(2, VALIDATION_MESSAGES.atLeastOne("The steps"))
      .max(LIST_LIMITS.steps, VALIDATION_MESSAGES.atMost("The steps", LIST_LIMITS.steps)),
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
  sectionOf("STATEMENT"),
  sectionOf("HIGHLIGHTS"),
  sectionOf("FOR_INSTITUTIONS"),
  sectionOf("FOR_FAMILIES"),
  sectionOf("PROCESS"),
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
