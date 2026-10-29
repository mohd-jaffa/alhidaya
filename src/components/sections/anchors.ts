import type { SectionType } from "@/constants/sections";

/** Each section type's place on its page's line (plan §30.1): the address a station links to. */
const ANCHORS: Record<SectionType, string> = {
  SIGN: "start",
  INTRO: "about",
  SERVICES_INDEX: "services",
  VALUES: "values",
  MISSION: "mission",
  INSTITUTIONS: "institutions",
  CLIENTS: "clients",
  CAREERS_BAND: "careers",
  JOBS_LIST: "jobs",
  CONTACT_BAND: "contact",
  CONTACT_DETAILS: "reach-us",
  FORM: "form",
  RICH_TEXT: "text",
};

/**
 * Every section's anchor, in page order: the type's own word, which does not
 * change when the admin rewrites a heading; a type used again on the page
 * takes a number ("text", "text-2").
 */
export function sectionAnchors(sections: readonly { type: SectionType }[]): string[] {
  const seen = new Map<SectionType, number>();
  return sections.map(({ type }) => {
    const count = (seen.get(type) ?? 0) + 1;
    seen.set(type, count);
    return count === 1 ? ANCHORS[type] : `${ANCHORS[type]}-${count}`;
  });
}
