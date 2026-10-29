import { describe, expect, it } from "vitest";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { PAGE_KEYS, SECTION_TYPES } from "@/constants/sections";
import { pageDocumentSchema, sectionSchema } from "@/lib/validation";
import { pageFixture, section } from "@tests/support/fixtures/content";

const messages = (page: Parameters<typeof pageDocumentSchema>[0], value: unknown) =>
  pageDocumentSchema(page)
    .safeParse(value)
    .error?.issues.map((issue) => issue.message) ?? [];

describe("sections", () => {
  it("each hold their own content", () => {
    for (const type of SECTION_TYPES) expect(sectionSchema.safeParse(section(type)).success, type).toBe(true);
    expect(
      sectionSchema.safeParse({ ...section("FORM"), content: { ...section("FORM").content, form: "OTHER" } }).success,
    ).toBe(false);
    expect(sectionSchema.safeParse({ ...section("SIGN"), id: "not-a-uuid" }).success).toBe(false);
  });
});

describe("a page", () => {
  it("is valid as each page's fixture", () => {
    for (const page of PAGE_KEYS) expect(messages(page, pageFixture(page)), page).toEqual([]);
  });

  it("opens with its sign, visible, and holds only one", () => {
    const home = pageFixture("HOME");
    expect(messages("HOME", { ...home, sections: home.sections.slice(1) })).toContain(VALIDATION_MESSAGES.signFirst);
    expect(
      messages("HOME", { ...home, sections: [{ ...home.sections[0], visible: false }, ...home.sections.slice(1)] }),
    ).toContain(VALIDATION_MESSAGES.signFirst);
    expect(messages("HOME", { ...home, sections: [...home.sections, section("SIGN")] })).toContain(
      VALIDATION_MESSAGES.signFirst,
    );
  });

  it("holds only what it allows, as many as it allows", () => {
    const home = pageFixture("HOME");
    expect(messages("HOME", { ...home, sections: [...home.sections, section("FORM")] })).toContain(
      VALIDATION_MESSAGES.sectionNotAllowed("FORM"),
    );
    expect(messages("HOME", { ...home, sections: [...home.sections, section("INTRO")] })).toContain(
      VALIDATION_MESSAGES.sectionLimit("INTRO", 1),
    );
    const about = pageFixture("ABOUT");
    const five = Array.from({ length: 5 }, () => section("RICH_TEXT"));
    expect(messages("ABOUT", { ...about, sections: [...about.sections, ...five] })).toContain(
      VALIDATION_MESSAGES.sectionLimit("RICH_TEXT", 4),
    );
  });

  it("keeps what it cannot work without, visible", () => {
    const contact = pageFixture("CONTACT");
    expect(messages("CONTACT", { ...contact, sections: contact.sections.slice(0, 2) })).toContain(
      VALIDATION_MESSAGES.sectionRequired("FORM"),
    );
    expect(
      messages("CONTACT", {
        ...contact,
        sections: [...contact.sections.slice(0, 2), { ...contact.sections[2], visible: false }],
      }),
    ).toContain(VALIDATION_MESSAGES.sectionRequired("FORM"));
  });

  it("never holds one section twice", () => {
    const home = pageFixture("HOME");
    const twice = {
      ...home,
      sections: [...home.sections.slice(0, 3), { ...section("CLIENTS"), id: home.sections[1].id }],
    };
    expect(messages("HOME", twice)).toContain(VALIDATION_MESSAGES.noRepeats("A page"));
  });
});
