import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { FIXED_FIRST_SECTION, PAGE_RULES, type PageKey, type SectionType } from "@/constants/sections";
import type { SectionForm } from "@/constants/statuses";
import type { SectionInput } from "@/lib/validation";

/**
 * What the Pages editor knows of each section type (plan §7.2, D88): its
 * fields, in order, each named as its check names it; a new section's blank
 * content; what may be added, hidden, moved or removed; and a row's words.
 */

/**
 * One field of a section: text on a line or several, a photo, text block by
 * block, the values, or which form; an icon picked from the set, a group of
 * fields kept together, and a list of items each holding its own fields.
 */
export type SectionField =
  | { kind: "line" | "lines"; name: string; label: string; max: number; required: boolean; hint?: string }
  | { kind: "photo" | "rich" | "values" | "form" | "pictogram"; name: string; label: string }
  | { kind: "group"; name: string; label: string; fields: readonly SectionField[] }
  | {
      kind: "list";
      name: string;
      label: string;
      /** What one item is called ("Slide"), and the action that adds one ("Add a slide"). */
      item: string;
      add: string;
      min: number;
      max: number;
      fields: readonly SectionField[];
    };

const line = (name: string, label: string, max: number, required = true): SectionField => ({
  kind: "line",
  name,
  label,
  max,
  required,
});
const lines = (name: string, label: string, max: number, required = false): SectionField => ({
  kind: "lines",
  name,
  label,
  max,
  required,
});
const heading = line("heading", ADMIN_TEXT.heading, TEXT_LIMITS.heading);
const photo: SectionField = { kind: "photo", name: "image", label: ADMIN_TEXT.photo };
const rich: SectionField = { kind: "rich", name: "body", label: ADMIN_TEXT.text };

const icon = (name = "pictogram"): SectionField => ({ kind: "pictogram", name, label: ADMIN_TEXT.icon });
const group = (name: string, label: string, fields: readonly SectionField[]): SectionField => ({
  kind: "group",
  name,
  label,
  fields,
});
const highlight = {
  ...line("highlight", ADMIN_TEXT.highlight, TEXT_LIMITS.heading, false),
  hint: ADMIN_TEXT.highlightHint,
} as SectionField;

/** Home's hero (D128): its slides, each with an optional button, and the card on the photo; no other page shows these. */
export const HERO_FIELDS: readonly SectionField[] = [
  {
    kind: "list",
    name: "slides",
    label: ADMIN_TEXT.slides,
    item: ADMIN_TEXT.slide,
    add: ADMIN_TEXT.addSlide,
    min: 1,
    max: LIST_LIMITS.slides,
    fields: [
      photo,
      line("headline", ADMIN_TEXT.headline, TEXT_LIMITS.heading),
      highlight,
      lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede),
      line("buttonLabel", ADMIN_TEXT.buttonLabel, TEXT_LIMITS.label, false),
      {
        ...line("buttonHref", ADMIN_TEXT.buttonLink, TEXT_LIMITS.url, false),
        hint: ADMIN_TEXT.buttonHint,
      } as SectionField,
    ],
  },
  group("note", ADMIN_TEXT.heroNote, [icon(), line("text", ADMIN_TEXT.note, TEXT_LIMITS.label, false)]),
];

export const SECTION_FIELDS: Record<SectionType, readonly SectionField[]> = {
  SIGN: [
    line("headline", ADMIN_TEXT.headline, TEXT_LIMITS.heading),
    highlight,
    lines("lede", ADMIN_TEXT.lede, TEXT_LIMITS.lede),
    photo,
  ],
  INTRO: [
    heading,
    highlight,
    rich,
    photo,
    {
      kind: "list",
      name: "points",
      label: ADMIN_TEXT.points,
      item: ADMIN_TEXT.point,
      add: ADMIN_TEXT.addPoint,
      min: 0,
      max: LIST_LIMITS.values,
      fields: [
        line("title", ADMIN_TEXT.valueTitle, TEXT_LIMITS.valueTitle),
        lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede),
      ],
    },
  ],
  SERVICES_INDEX: [heading, lines("intro", ADMIN_TEXT.introduction, TEXT_LIMITS.lede)],
  VALUES: [heading, { kind: "values", name: "items", label: ADMIN_TEXT.values }],
  MISSION: [
    lines("mission", ADMIN_TEXT.mission, TEXT_LIMITS.sectionText, true),
    lines("vision", ADMIN_TEXT.vision, TEXT_LIMITS.sectionText, true),
  ],
  INSTITUTIONS: [heading, lines("text", ADMIN_TEXT.text, TEXT_LIMITS.sectionText, true), photo],
  CLIENTS: [heading],
  CAREERS_BAND: [heading, lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede)],
  JOBS_LIST: [
    lines("intro", ADMIN_TEXT.introduction, TEXT_LIMITS.sectionText),
    lines("emptyText", ADMIN_TEXT.emptyJobs, TEXT_LIMITS.lede, true),
  ],
  CONTACT_BAND: [heading, lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede)],
  CONTACT_DETAILS: [heading],
  FORM: [
    heading,
    lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede),
    { kind: "form", name: "form", label: ADMIN_TEXT.whichForm },
  ],
  RICH_TEXT: [line("heading", ADMIN_TEXT.heading, TEXT_LIMITS.heading, false), rich],
  SERVICES_ROW: [heading, lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede)],
};

/** A section's fields on its page: Home's sign is its hero, its slides in place of a page header's words (D128). */
export function sectionFields(page: PageKey, type: SectionType): readonly SectionField[] {
  return type === "SIGN" && page === "HOME" ? HERO_FIELDS : SECTION_FIELDS[type];
}

/** A list item's blank: an object of its fields' values. */
export function blankItem(page: PageKey, fields: readonly SectionField[]): unknown {
  return Object.fromEntries(fields.map((inner) => [inner.name, blankValue(page, inner)]));
}

/**
 * A field's first value in a new section: blank text, no photo or icon, one
 * empty paragraph or value, the page's own form, a group's own blanks, and a
 * list's least number of blank items.
 */
export function blankValue(page: PageKey, field: SectionField): unknown {
  switch (field.kind) {
    case "photo":
    case "pictogram":
      return null;
    case "group":
      return Object.fromEntries(field.fields.map((inner) => [inner.name, blankValue(page, inner)]));
    case "list":
      return Array.from({ length: field.min }, () => blankItem(page, field.fields));
    case "rich":
      return [{ type: "paragraph", text: { en: "" } }];
    case "values":
      return [{ title: { en: "" }, text: { en: "" } }];
    case "form":
      return (page === "QUOTE" ? "QUOTE" : page === "HOME" ? "SHORT_QUOTE" : "CONTACT") satisfies SectionForm;
    default:
      return { en: "" };
  }
}

/** A section added to a page (D87): visible, blank, for the admin to fill before it can be saved. */
export function blankSection(page: PageKey, type: SectionType): SectionInput {
  const content = Object.fromEntries(sectionFields(page, type).map((field) => [field.name, blankValue(page, field)]));
  return { id: crypto.randomUUID(), type, visible: true, content } as SectionInput;
}

/** What may be added to a page (D87): the types it allows, but never its sign, and none past its limit. */
export function addableTypes(page: PageKey, types: readonly SectionType[]): SectionType[] {
  const rule = PAGE_RULES[page];
  return rule.allowed.filter(
    (type) => type !== FIXED_FIRST_SECTION && types.filter((held) => held === type).length < (rule.max?.[type] ?? 1),
  );
}

/**
 * Why a section may not be changed (plan §7.1, D87): the sign is first and
 * fixed; a section the page cannot work without stays visible and stays,
 * unless another visible one of its type is there.
 */
export function sectionLock(
  page: PageKey,
  sections: readonly Pick<SectionInput, "type" | "visible">[],
  index: number,
): "fixed" | "needed" | null {
  const section = sections[index];
  if (index === 0 && section.type === FIXED_FIRST_SECTION) return "fixed";
  if (!PAGE_RULES[page].required?.includes(section.type)) return null;
  const others = sections.filter((other, at) => at !== index && other.type === section.type && other.visible);
  return others.length === 0 ? "needed" : null;
}

type Localized = { en?: string | null } | undefined;

/** A row's words (D88): what the section says first, so the admin knows it at a glance. */
export function sectionSummary(content: Record<string, unknown>): string {
  // Home's hero says its first slide (D128).
  const slide = (content.slides as { headline?: Localized }[] | undefined)?.[0]?.headline?.en?.trim();
  if (slide) return slide;
  for (const name of ["headline", "heading", "mission", "intro", "emptyText"]) {
    const text = (content[name] as Localized)?.en?.trim();
    if (text) return text;
  }
  for (const block of (content.body as Record<string, unknown>[] | undefined) ?? []) {
    const text = (
      (block.text ?? block.label ?? (block.items as Localized[] | undefined)?.[0]) as Localized
    )?.en?.trim();
    if (text) return text;
  }
  return "";
}
