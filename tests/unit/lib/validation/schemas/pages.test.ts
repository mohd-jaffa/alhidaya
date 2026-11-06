import { describe, expect, it } from "vitest";

import { SECTION_NAMES } from "@/constants/admin-messages";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { PAGE_KEYS, SECTION_TYPES } from "@/constants/sections";
import { pageDocumentSchema, sectionSchema } from "@/lib/validation";
import { pageFixture, section, slideFixture } from "@tests/support/fixtures/content";

const messages = (page: Parameters<typeof pageDocumentSchema>[0], value: unknown) =>
  pageDocumentSchema(page)
    .safeParse(value)
    .error?.issues.map((issue) => issue.message) ?? [];

describe("sections", () => {
  it("keeps legacy jobs documents valid and accepts only a valid optional photo reference (D174)", () => {
    const jobs = section("JOBS_LIST");
    for (const image of [undefined, null, { mediaId: crypto.randomUUID() }])
      expect(sectionSchema.safeParse({ ...jobs, content: { ...jobs.content, image } }).success).toBe(true);
    expect(sectionSchema.safeParse({ ...jobs, content: { ...jobs.content, image: { mediaId: "bad" } } }).success).toBe(
      false,
    );
  });
  it("accepts optional slider-pill visibility and refuses non-booleans (D157)", () => {
    const sign = section("SIGN");
    for (const hideNote of [true, false, undefined])
      expect(sectionSchema.safeParse({ ...sign, content: { ...sign.content, hideNote } }).success).toBe(true);
    expect(sectionSchema.safeParse({ ...sign, content: { ...sign.content, hideNote: "yes" } }).success).toBe(false);
  });
  it("accepts optional opening-action visibility and rejects non-boolean values (D156)", () => {
    const sign = section("SIGN");
    expect(sectionSchema.safeParse({ ...sign, content: { ...sign.content, showActions: true } }).success).toBe(true);
    expect(sectionSchema.safeParse({ ...sign, content: { ...sign.content, showActions: "yes" } }).success).toBe(false);
  });
  it("each hold their own content", () => {
    for (const type of SECTION_TYPES) expect(sectionSchema.safeParse(section(type)).success, type).toBe(true);
    expect(
      sectionSchema.safeParse({ ...section("FORM"), content: { ...section("FORM").content, form: "OTHER" } }).success,
    ).toBe(false);
    expect(sectionSchema.safeParse({ ...section("SIGN"), id: "not-a-uuid" }).success).toBe(false);
  });
});

describe("Home's slides (D128)", () => {
  const sign = (slides: unknown[]) => ({ ...section("SIGN"), content: { ...section("SIGN").content, slides } });
  const firstMessage = (value: unknown) => sectionSchema.safeParse(value).error?.issues[0].message;

  it("take a button only with both its wording and its link, a blank link read as none", () => {
    const parsed = sectionSchema.parse(sign([slideFixture({ buttonLabel: { en: "" }, buttonHref: { en: "" } })]));
    expect(parsed.type === "SIGN" && parsed.content.slides[0].buttonHref).toEqual({ en: null });
    expect(
      sectionSchema.safeParse(
        sign([slideFixture({ buttonLabel: { en: "Request a quote" }, buttonHref: { en: "/request-a-quote" } })]),
      ).success,
    ).toBe(true);
    expect(firstMessage(sign([slideFixture({ buttonLabel: { en: "Request a quote" } })]))).toBe(
      VALIDATION_MESSAGES.buttonNeedsBoth,
    );
    expect(firstMessage(sign([slideFixture({ buttonHref: { en: "/request-a-quote" } })]))).toBe(
      VALIDATION_MESSAGES.buttonNeedsBoth,
    );
    expect(
      firstMessage(sign([slideFixture({ buttonLabel: { en: "Go" }, buttonHref: { en: "javascript:alert(1)" } })])),
    ).toBe(VALIDATION_MESSAGES.link);
  });

  it("are at most eight, and Home's hero shows at least one", () => {
    expect(firstMessage(sign(Array.from({ length: 9 }, () => slideFixture())))).toBe(
      VALIDATION_MESSAGES.atMost("Slides", 8),
    );
    const home = pageFixture("HOME");
    const empty = { ...home, sections: [sign([]), ...home.sections.slice(1)] };
    expect(messages("HOME", empty)).toEqual([VALIDATION_MESSAGES.atLeastOne("Slides")]);
    expect(
      messages("ABOUT", { ...pageFixture("ABOUT"), sections: [sign([]), ...pageFixture("ABOUT").sections.slice(1)] }),
    ).toEqual([]);
  });
});

describe("a page", () => {
  it("lets Careers move and hide its single retained header, while jobs stay visible (D148)", () => {
    const careers = pageFixture("CAREERS");
    const [sign, jobs] = careers.sections;
    expect(messages("CAREERS", { ...careers, sections: [jobs, { ...sign, visible: false }] })).toEqual([]);
    expect(messages("CAREERS", { ...careers, sections: [jobs, sign] })).toEqual([]);
    expect(messages("CAREERS", { ...careers, sections: [jobs] })).toContain(
      VALIDATION_MESSAGES.sectionRequired(SECTION_NAMES.SIGN),
    );
    expect(messages("CAREERS", { ...careers, sections: [sign, jobs, section("SIGN")] })).toContain(
      VALIDATION_MESSAGES.sectionLimit(SECTION_NAMES.SIGN, 1),
    );
    expect(messages("CAREERS", { ...careers, sections: [sign, { ...jobs, visible: false }] })).toContain(
      VALIDATION_MESSAGES.sectionRequired(SECTION_NAMES.JOBS_LIST),
    );
  });
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
    expect(messages("HOME", { ...home, sections: [...home.sections, section("CONTACT_DETAILS")] })).toContain(
      VALIDATION_MESSAGES.sectionNotAllowed(SECTION_NAMES.CONTACT_DETAILS),
    );
    expect(messages("HOME", { ...home, sections: [...home.sections, section("INTRO")] })).toContain(
      VALIDATION_MESSAGES.sectionLimit(SECTION_NAMES.INTRO, 1),
    );
    const about = pageFixture("ABOUT");
    const five = Array.from({ length: 5 }, () => section("RICH_TEXT"));
    expect(messages("ABOUT", { ...about, sections: [...about.sections, ...five] })).toContain(
      VALIDATION_MESSAGES.sectionLimit(SECTION_NAMES.RICH_TEXT, 4),
    );
  });

  it("keeps what it cannot work without, visible", () => {
    const contact = pageFixture("CONTACT");
    expect(messages("CONTACT", { ...contact, sections: contact.sections.slice(0, 2) })).toContain(
      VALIDATION_MESSAGES.sectionRequired(SECTION_NAMES.FORM),
    );
    expect(
      messages("CONTACT", {
        ...contact,
        sections: [...contact.sections.slice(0, 2), { ...contact.sections[2], visible: false }],
      }),
    ).toContain(VALIDATION_MESSAGES.sectionRequired(SECTION_NAMES.FORM));
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
