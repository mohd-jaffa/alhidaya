import type { Station } from "@/components/motion/TheLine";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import type { PageKey, SectionType } from "@/constants/sections";
import type { SectionData } from "@/features/content/types";
import type { Section } from "@/lib/validation";

import { shownClients } from "./ClientsSection";

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

/** What a station is called: the section's own heading, or the words that stand for it. */
function stationLabel(page: PageKey, section: Section): string {
  switch (section.type) {
    case "SIGN":
      return PAGE_NAMES[page];
    case "MISSION":
      return UI_TEXT.mission;
    case "JOBS_LIST":
      return UI_TEXT.openJobs;
    case "RICH_TEXT":
      // Text with no heading of its own is the page's own text: Privacy, Terms.
      return section.content.heading.en ?? PAGE_NAMES[page];
    default:
      return section.content.heading.en;
  }
}

/**
 * The page's line (plan §30.1): a station for each section it shows, at its
 * anchor, named so "You are here" can say where the visitor is. A clients
 * section with no logo to show is not on the page, so not on the line.
 */
export function pageStations(page: PageKey, sections: readonly Section[], data: SectionData): Station[] {
  const anchors = sectionAnchors(sections);
  return sections.flatMap((section, index) =>
    section.type === "CLIENTS" && shownClients(data.clients, data.images).length === 0
      ? []
      : [{ id: anchors[index], label: stationLabel(page, section) }],
  );
}
