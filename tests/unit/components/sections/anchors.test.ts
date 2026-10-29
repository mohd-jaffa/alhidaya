import { describe, expect, it } from "vitest";

import { pageStations, sectionAnchors } from "@/components/sections/anchors";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import type { SectionData } from "@/features/content/types";
import type { Section } from "@/lib/validation";
import { clientFixture, imageFixture, publishedFixture, section } from "@tests/support/fixtures/content";

const en = <T>(value: T) => ({ en: value });
const noData: SectionData = { site: null, services: [], jobs: [], clients: [], images: new Map() };
const richText = (heading: string | null, body: Extract<Section, { type: "RICH_TEXT" }>["content"]["body"]) =>
  ({ ...section("RICH_TEXT"), content: { heading: en(heading), body } }) as Section;

describe("sectionAnchors", () => {
  it("names each section by its type, numbering a type used again", () => {
    expect(
      sectionAnchors([{ type: "SIGN" }, { type: "RICH_TEXT" }, { type: "CONTACT_BAND" }, { type: "RICH_TEXT" }]),
    ).toEqual(["start", "text", "contact", "text-2"]);
  });
});

describe("pageStations", () => {
  it("puts each section on the line at its anchor, named by its heading or the words that stand for it", () => {
    const sections = [
      section("SIGN"),
      section("MISSION"),
      section("JOBS_LIST"),
      section("VALUES"),
      richText("Our story", []),
      richText(null, [
        { type: "paragraph", text: en("Text.") },
        { type: "heading", text: en("What we collect") },
      ]),
      richText(null, [{ type: "paragraph", text: en("Text.") }]),
    ];
    expect(pageStations("ABOUT", sections, noData)).toEqual([
      { id: "start", label: PAGE_NAMES.ABOUT },
      { id: "mission", label: UI_TEXT.mission },
      { id: "jobs", label: UI_TEXT.openJobs },
      { id: "values", label: "Why us" },
      { id: "text", label: "Our story" },
      { id: "text-2", label: "What we collect" },
      { id: "text-3", label: PAGE_NAMES.ABOUT },
    ]);
  });

  it("leaves the clients off the line until a logo can be shown", () => {
    const client = publishedFixture(clientFixture());
    const sections = [section("SIGN"), section("CLIENTS")];
    expect(pageStations("HOME", sections, { ...noData, clients: [client] }).map((station) => station.id)).toEqual([
      "start",
    ]);
    const images = new Map([[client.published.logo.mediaId, imageFixture()]]);
    expect(
      pageStations("HOME", sections, { ...noData, clients: [client], images }).map((station) => station.id),
    ).toEqual(["start", "clients"]);
  });
});
