import { describe, expect, it } from "vitest";
import * as z from "zod";

import { VALIDATION_MESSAGES } from "@/constants/messages";
import { hrefSchema, httpsUrlSchema, isoDateSchema, isSafeHref, richTextSchema, slugSchema } from "@/lib/validation";
import { imageRefSchema, withoutRepeats } from "@/lib/validation/schemas/content";

const message = (schema: z.ZodType, value: unknown) => schema.safeParse(value).error?.issues[0].message;

describe("photo reference framing", () => {
  const mediaId = "11111111-1111-4111-8111-111111111111";
  it("keeps old references valid and accepts all physical edges", () => {
    expect(imageRefSchema.parse({ mediaId })).toEqual({ mediaId });
    for (const focalPoint of [
      { x: 0, y: 100 },
      { x: 100, y: 0 },
      { x: 50, y: 50 },
    ])
      expect(imageRefSchema.parse({ mediaId, focalPoint })).toEqual({ mediaId, focalPoint });
  });
  it("rejects malformed, fractional and out-of-range coordinates with catalogue messages", () => {
    for (const focalPoint of [
      null,
      {},
      { x: -1, y: 50 },
      { x: 50, y: 101 },
      { x: 1.5, y: 50 },
      { x: "50", y: 50 },
      { x: Infinity, y: 50 },
    ])
      expect(imageRefSchema.safeParse({ mediaId, focalPoint }).success).toBe(false);
    expect(message(imageRefSchema, { mediaId, focalPoint: { x: -1, y: 0 } })).toBe(VALIDATION_MESSAGES.invalid);
  });
});

describe("links", () => {
  it("lead to a page of this site, or to an https address", () => {
    for (const href of ["/services", "/careers/registered-nurse?x=1#top", "https://instagram.com/x"])
      expect(isSafeHref(href), href).toBe(true);
  });

  it("never run script, leave for another scheme, or carry credentials", () => {
    for (const href of [
      "javascript:alert(1)",
      "//evil.example",
      "http://plain.example",
      "data:text/html,x",
      "https://user:pw@evil.example",
      "mailto:a@b.c",
      "not a link",
    ]) {
      expect(isSafeHref(href), href).toBe(false);
    }
    expect(message(hrefSchema, "javascript:alert(1)")).toBe(VALIDATION_MESSAGES.link);
    expect(message(hrefSchema, `/${"a".repeat(600)}`)).toBe(VALIDATION_MESSAGES.link);
    expect(message(httpsUrlSchema, "/services")).toBe(VALIDATION_MESSAGES.link);
    expect(httpsUrlSchema.parse(" https://maps.google.com/x ")).toBe("https://maps.google.com/x");
  });
});

describe("slugs and dates", () => {
  it("keep a web address simple", () => {
    expect(slugSchema.parse("home-nursing-care")).toBe("home-nursing-care");
    for (const bad of ["Home", "two--hyphens", "-edge", "spa ce", "a".repeat(81)])
      expect(message(slugSchema, bad), bad).toBe(VALIDATION_MESSAGES.slug);
  });

  it("take only real calendar days", () => {
    const date = isoDateSchema("The date");
    expect(date.parse("2026-02-28")).toBe("2026-02-28");
    expect(message(date, "2026-02-30")).toBe(VALIDATION_MESSAGES.date("The date"));
    expect(message(date, "28/02/2026")).toBe(VALIDATION_MESSAGES.date("The date"));
  });
});

describe("rich text", () => {
  it("holds headings, paragraphs, lists and safe links, never HTML", () => {
    const body = [
      { type: "heading", text: { en: "Care" } },
      { type: "paragraph", text: { en: "Line one\r\nLine two" } },
      { type: "list", items: [{ en: "One" }] },
      { type: "link", label: { en: "Contact" }, href: "/contact" },
    ];
    expect(richTextSchema.parse(body)[1]).toEqual({ type: "paragraph", text: { en: "Line one\nLine two" } });
    expect(richTextSchema.safeParse([{ type: "html", html: "<script>" }]).success).toBe(false);
    expect(message(richTextSchema, [{ type: "list", items: [] }])).toBe(VALIDATION_MESSAGES.atLeastOne("A list"));
    expect(message(richTextSchema, [{ type: "list", items: Array(21).fill({ en: "x" }) }])).toBe(
      VALIDATION_MESSAGES.atMost("A list", 20),
    );
    expect(message(richTextSchema, Array(61).fill({ type: "heading", text: { en: "x" } }))).toBe(
      VALIDATION_MESSAGES.atMost("The text", 60),
    );
  });
});

describe("withoutRepeats", () => {
  it("refuses the same one twice", () => {
    const list = z.array(z.string()).superRefine(withoutRepeats("Tags", (tag) => tag));
    expect(list.safeParse(["a", "b"]).success).toBe(true);
    expect(message(list, ["a", "a"])).toBe(VALIDATION_MESSAGES.noRepeats("Tags"));
  });
});
