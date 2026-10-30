import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";
import { FIXED_FIRST_SECTION, PAGE_RULES, type PageKey, type SectionType } from "@/constants/sections";
import type { FormKind } from "@/constants/statuses";
import type { SectionInput } from "@/lib/validation";

/**
 * What the Pages editor knows of each section type (plan §7.2, D88): its
 * fields, in order, each named as its check names it; a new section's blank
 * content; what may be added, hidden, moved or removed; and a row's words.
 */

/** One field of a section: text on a line or several, a photo, text block by block, the values, or which form. */
export type SectionField =
  | { kind: "line" | "lines"; name: string; label: string; max: number; required: boolean }
  | { kind: "photo" | "rich" | "values" | "form"; name: string; label: string };

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

export const SECTION_FIELDS: Record<SectionType, readonly SectionField[]> = {
  SIGN: [
    line("headline", ADMIN_TEXT.headline, TEXT_LIMITS.heading),
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
};

/** A field's first value in a new section: blank text, no photo, one empty paragraph or value, the page's own form. */
function blankValue(page: PageKey, field: SectionField): unknown {
  switch (field.kind) {
    case "photo":
      return null;
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
  const content = Object.fromEntries(SECTION_FIELDS[type].map((field) => [field.name, blankValue(page, field)]));
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

/** How many fields a form's errors mark (D88): each message once, wherever it sits. */
export function countErrors(node: unknown): number {
  if (!node || typeof node !== "object") return 0;
  const record = node as Record<string, unknown>;
  if (typeof record.message === "string") return 1;
  return Object.entries(record).reduce((sum, [key, value]) => (key === "ref" ? sum : sum + countErrors(value)), 0);
}
