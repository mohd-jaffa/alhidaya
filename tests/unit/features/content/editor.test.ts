import { describe, expect, it } from "vitest";

import { PAGE_KEYS, PAGE_RULES, SECTION_TYPES } from "@/constants/sections";
import {
  addableTypes,
  blankItem,
  blankSection,
  sectionFields,
  sectionLock,
  sectionSummary,
} from "@/features/content/editor";
import { pageDocumentSchema, sectionSchema } from "@/lib/validation";
import { contentFixture, pageFixture, section } from "@tests/support/fixtures/content";

describe("the editor's fields", () => {
  it("name every part of each section type's content, and nothing else", () => {
    for (const type of SECTION_TYPES) {
      // Home's sign holds its hero's fields too (D97): every part of the content is named somewhere.
      expect(
        sectionFields("HOME", type)
          .map((field) => field.name)
          .toSorted(),
        type,
      ).toEqual(Object.keys(contentFixture(type)).toSorted());
    }
  });

  it("start a new section blank and visible, refused until it is filled, the form one the page's own", () => {
    for (const page of PAGE_KEYS) {
      for (const type of PAGE_RULES[page].allowed) {
        const blank = blankSection(page, type);
        expect(blank).toMatchObject({ type, visible: true, id: expect.any(String) });
        const parsed = sectionSchema.safeParse(blank);
        // Every type has something to fill, even one that shows what is kept elsewhere: its heading.
        expect(parsed.success, `${page} ${type}`).toBe(false);
      }
    }
    expect(blankSection("QUOTE", "FORM").content).toMatchObject({ form: "QUOTE" });
    expect(blankSection("CONTACT", "FORM").content).toMatchObject({ form: "CONTACT" });
    expect(blankSection("PRIVACY", "RICH_TEXT").content).toEqual({
      heading: { en: "" },
      body: [{ type: "paragraph", text: { en: "" } }],
    });
    expect(blankSection("HOME", "VALUES").content).toMatchObject({ items: [{ title: { en: "" }, text: { en: "" } }] });
    expect(blankSection("HOME", "INTRO").content).toMatchObject({ image: null });
  });

  it("start the redesign's sections with their least items blank, and Home's sign with its hero empty (D97)", () => {
    expect(blankSection("HOME", "STATEMENT").content).toEqual({
      parts: [{ text: { en: "" }, strong: false, pictogram: null }],
    });
    expect(blankSection("HOME", "PROCESS").content).toMatchObject({ steps: [{ image: null }, { image: null }] });
    expect(blankSection("HOME", "SIGN").content).toMatchObject({
      avatars: [],
      chips: [],
      card: { title: { en: "" }, tag: { en: "" }, image: null },
      note: { pictogram: null, text: { en: "" } },
    });
    expect(blankSection("ABOUT", "SIGN").content).not.toHaveProperty("avatars");
    expect(blankItem("HOME", [{ kind: "line", name: "", label: "Chip", max: 32, required: true }])).toEqual({ en: "" });
  });

  it("offer only what a page can still hold, never its sign (D87)", () => {
    expect(addableTypes("QUOTE", ["SIGN", "FORM"])).toEqual([]);
    expect(addableTypes("QUOTE", ["SIGN"])).toEqual(["FORM"]);
    expect(addableTypes("PRIVACY", ["SIGN", "RICH_TEXT"])).toEqual(["RICH_TEXT"]);
    expect(addableTypes("PRIVACY", ["SIGN", ...Array<"RICH_TEXT">(12).fill("RICH_TEXT")])).toEqual([]);
    expect(
      addableTypes(
        "HOME",
        pageFixture("HOME").sections.map((held) => held.type),
      ),
    ).toEqual([
      "STATEMENT",
      "HIGHLIGHTS",
      "FOR_INSTITUTIONS",
      "FOR_FAMILIES",
      "PROCESS",
      "FORM",
      "VALUES",
      "INSTITUTIONS",
      "CLIENTS",
      "CAREERS_BAND",
    ]);
  });

  it("keep the sign first and fixed, and a section the page needs visible and there", () => {
    const quote = pageFixture("QUOTE").sections;
    expect(sectionLock("QUOTE", quote, 0)).toBe("fixed");
    expect(sectionLock("QUOTE", quote, 1)).toBe("needed");
    const privacy = [...pageFixture("PRIVACY").sections, section("RICH_TEXT")];
    expect(sectionLock("PRIVACY", privacy, 1)).toBeNull();
    expect(sectionLock("PRIVACY", [privacy[0], privacy[1], section("RICH_TEXT", false)], 1)).toBe("needed");
    expect(sectionLock("HOME", pageFixture("HOME").sections, 1)).toBeNull();
    expect(sectionLock("HOME", [section("INTRO"), section("SIGN")], 0)).toBeNull();
  });

  it("word a row by what its section says first", () => {
    expect(sectionSummary({ headline: { en: " Care at home " } })).toBe("Care at home");
    expect(
      sectionSummary({ label: { en: "For families" }, headingStart: { en: "Care for the people you love," } }),
    ).toBe("Care for the people you love,");
    expect(
      sectionSummary({
        parts: [{ text: { en: "We bring" } }, { text: { en: " " } }, { text: { en: "nursing care" } }],
      }),
    ).toBe("We bring nursing care");
    expect(sectionSummary({ note: { title: { en: "Across Doha" } } })).toBe("Across Doha");
    expect(sectionSummary({ parts: [], note: { title: { en: "" } } })).toBe("");
    expect(sectionSummary({ heading: { en: "" }, mission: { en: "Our mission." } })).toBe("Our mission.");
    expect(sectionSummary({ intro: { en: null }, emptyText: { en: "No openings." } })).toBe("No openings.");
    expect(
      sectionSummary({
        heading: { en: null },
        body: [
          { type: "paragraph", text: { en: "  " } },
          { type: "list", items: [{ en: "First line" }] },
        ],
      }),
    ).toBe("First line");
    expect(sectionSummary({ body: [{ type: "link", label: { en: "Contact us" }, href: "/contact" }] })).toBe(
      "Contact us",
    );
    expect(sectionSummary({ heading: { en: "" } })).toBe("");
  });

  it("agree with the page's checks on what a filled page is", () => {
    expect(pageDocumentSchema("HOME").safeParse(pageFixture("HOME")).success).toBe(true);
  });
});
