import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { FIXED_FIRST_SECTION, PAGE_RULES, type PageKey, type SectionType } from "@/constants/sections";
import type { FormKind } from "@/constants/statuses";
import type { SectionInput } from "@/lib/validation";

/**
 * What the Pages editor knows of each section type (plan §7.2, D88): its
 * fields, in order, each named as its check names it; a new section's blank
 * content; what may be added, hidden, moved or removed; and a row's words.
 */

/**
 * One field of a section: text on a line or several, a photo, text block by
 * block, the values, or which form; and the redesign's parts (D100): an icon
 * picked from the set, a yes or no, a group of faces, a group of fields kept
 * together, and a list of items each holding its own fields.
 */
export type SectionField =
  | { kind: "line" | "lines"; name: string; label: string; max: number; required: boolean; hint?: string }
  | { kind: "photo" | "rich" | "values" | "form" | "pictogram" | "toggle"; name: string; label: string }
  | { kind: "faces"; name: string; label: string; max: number }
  | { kind: "group"; name: string; label: string; fields: readonly SectionField[] }
  | {
      kind: "list";
      name: string;
      label: string;
      /** What one item is called ("Step"), and the action that adds one ("Add a step"). */
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

/* The redesign's parts (D97, D100). */
const icon = (name = "pictogram"): SectionField => ({ kind: "pictogram", name, label: ADMIN_TEXT.icon });
const faces = (max: number, name = "avatars"): SectionField => ({ kind: "faces", name, label: ADMIN_TEXT.faces, max });
const group = (name: string, label: string, fields: readonly SectionField[]): SectionField => ({
  kind: "group",
  name,
  label,
  fields,
});
const title = line("title", ADMIN_TEXT.valueTitle, TEXT_LIMITS.label);
const shortText = lines("text", ADMIN_TEXT.text, TEXT_LIMITS.lede);
const figure = (required: boolean): SectionField[] => [
  { ...line("value", ADMIN_TEXT.figure, TEXT_LIMITS.figure, required), hint: ADMIN_TEXT.figureHint } as SectionField,
  line("label", ADMIN_TEXT.figureCounts, TEXT_LIMITS.label, required),
];
const pictured = (name: string, label: string): SectionField =>
  group(name, label, [photo, lines("text", ADMIN_TEXT.wordsOnPhoto, TEXT_LIMITS.lede)]);
/** An audience's opening: its pill, then its heading with an icon between two parts. */
const opening: SectionField[] = [
  line("label", ADMIN_TEXT.pillLabel, TEXT_LIMITS.chip),
  line("headingStart", ADMIN_TEXT.heading, TEXT_LIMITS.heading),
  icon(),
  line("headingEnd", ADMIN_TEXT.headingEnd, TEXT_LIMITS.heading, false),
];

/** Home's hero (D97): what the top of Home holds besides a page's sign (and its highlight, D109); no other page shows these. */
export const HERO_FIELDS: readonly SectionField[] = [
  faces(LIST_LIMITS.avatars),
  {
    kind: "list",
    name: "chips",
    label: ADMIN_TEXT.chips,
    item: ADMIN_TEXT.chip,
    add: ADMIN_TEXT.addChip,
    min: 0,
    max: LIST_LIMITS.chips,
    fields: [{ kind: "line", name: "", label: ADMIN_TEXT.chip, max: TEXT_LIMITS.chip, required: true }],
  },
  group("card", ADMIN_TEXT.heroCard, [
    line("title", ADMIN_TEXT.card, TEXT_LIMITS.label, false),
    line("tag", ADMIN_TEXT.cardTag, TEXT_LIMITS.label, false),
    photo,
  ]),
  group("note", ADMIN_TEXT.heroNote, [icon(), line("text", ADMIN_TEXT.note, TEXT_LIMITS.label, false)]),
  group("fact", ADMIN_TEXT.heroFact, figure(false)),
];

export const SECTION_FIELDS: Record<SectionType, readonly SectionField[]> = {
  SIGN: [
    line("headline", ADMIN_TEXT.headline, TEXT_LIMITS.heading),
    {
      ...line("highlight", ADMIN_TEXT.highlight, TEXT_LIMITS.heading, false),
      hint: ADMIN_TEXT.highlightHint,
    } as SectionField,
    lines("lede", ADMIN_TEXT.lede, TEXT_LIMITS.lede),
    photo,
  ],
  INTRO: [heading, rich, photo],
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
  STATEMENT: [
    {
      kind: "list",
      name: "parts",
      label: ADMIN_TEXT.statementParts,
      item: ADMIN_TEXT.part,
      add: ADMIN_TEXT.addPart,
      min: 1,
      max: LIST_LIMITS.statementParts,
      fields: [
        line("text", ADMIN_TEXT.partText, TEXT_LIMITS.line),
        { kind: "toggle", name: "strong", label: ADMIN_TEXT.partStrong },
        icon(),
      ],
    },
  ],
  HIGHLIGHTS: [
    group("note", ADMIN_TEXT.noteCard, [icon(), title, shortText]),
    group("first", ADMIN_TEXT.firstPhoto, [photo, line("label", ADMIN_TEXT.wordsOnPhoto, TEXT_LIMITS.label, false)]),
    group("accent", ADMIN_TEXT.accentCard, [
      title,
      shortText,
      faces(4),
      group("fact", ADMIN_TEXT.figure, figure(false)),
    ]),
    group("second", ADMIN_TEXT.secondPhoto, [photo, line("label", ADMIN_TEXT.wordsOnPhoto, TEXT_LIMITS.label, false)]),
  ],
  FOR_INSTITUTIONS: [
    ...opening,
    group("team", ADMIN_TEXT.teamCard, [title, shortText, faces(LIST_LIMITS.avatars)]),
    pictured("photo", ADMIN_TEXT.photoCard),
    group("reach", ADMIN_TEXT.reachCard, [title, faces(4)]),
    {
      kind: "list",
      name: "facts",
      label: ADMIN_TEXT.figures,
      item: ADMIN_TEXT.figure,
      add: ADMIN_TEXT.addFigure,
      min: 0,
      max: LIST_LIMITS.facts,
      fields: figure(true),
    },
  ],
  FOR_FAMILIES: [
    ...opening,
    pictured("photo", ADMIN_TEXT.photoCard),
    {
      kind: "list",
      name: "features",
      label: ADMIN_TEXT.features,
      item: ADMIN_TEXT.feature,
      add: ADMIN_TEXT.addFeature,
      min: 0,
      max: LIST_LIMITS.features,
      fields: [icon(), title],
    },
  ],
  PROCESS: [
    ...opening,
    {
      kind: "list",
      name: "steps",
      label: ADMIN_TEXT.steps,
      item: ADMIN_TEXT.step,
      add: ADMIN_TEXT.addStep,
      min: 2,
      max: LIST_LIMITS.steps,
      fields: [photo, line("title", ADMIN_TEXT.step, TEXT_LIMITS.valueTitle), shortText],
    },
  ],
};

/** A section's fields on its page: Home's sign is its hero, with the hero's own besides (D97). */
export function sectionFields(page: PageKey, type: SectionType): readonly SectionField[] {
  return type === "SIGN" && page === "HOME" ? [...SECTION_FIELDS.SIGN, ...HERO_FIELDS] : SECTION_FIELDS[type];
}

/** A list item's blank: its one unnamed field's value, or an object of its fields' values. */
export function blankItem(page: PageKey, fields: readonly SectionField[]): unknown {
  return fields.length === 1 && fields[0].name === ""
    ? blankValue(page, fields[0])
    : Object.fromEntries(fields.map((inner) => [inner.name, blankValue(page, inner)]));
}

/**
 * A field's first value in a new section: blank text, no photo or icon, one
 * empty paragraph or value, the page's own form, no faces, a group's own
 * blanks, and a list's least number of blank items.
 */
export function blankValue(page: PageKey, field: SectionField): unknown {
  switch (field.kind) {
    case "photo":
    case "pictogram":
      return null;
    case "toggle":
      return false;
    case "faces":
      return [];
    case "group":
      return Object.fromEntries(field.fields.map((inner) => [inner.name, blankValue(page, inner)]));
    case "list":
      return Array.from({ length: field.min }, () => blankItem(page, field.fields));
    case "rich":
      return [{ type: "paragraph", text: { en: "" } }];
    case "values":
      return [{ title: { en: "" }, text: { en: "" } }];
    case "form":
      return (page === "QUOTE" ? "QUOTE" : "CONTACT") satisfies FormKind;
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
  for (const name of ["headline", "heading", "headingStart", "mission", "intro", "emptyText"]) {
    const text = (content[name] as Localized)?.en?.trim();
    if (text) return text;
  }
  // A statement says its phrases in turn; the highlights, their first card's title.
  const parts = (content.parts as { text?: Localized }[] | undefined) ?? [];
  const said = parts
    .map((part) => part.text?.en?.trim())
    .filter(Boolean)
    .join(" ");
  if (said) return said;
  const note = (content.note as { title?: Localized } | undefined)?.title?.en?.trim();
  if (note) return note;
  for (const block of (content.body as Record<string, unknown>[] | undefined) ?? []) {
    const text = (
      (block.text ?? block.label ?? (block.items as Localized[] | undefined)?.[0]) as Localized
    )?.en?.trim();
    if (text) return text;
  }
  return "";
}
