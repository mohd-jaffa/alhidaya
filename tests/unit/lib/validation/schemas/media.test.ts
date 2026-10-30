import { describe, expect, it } from "vitest";

import { TEXT_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { imageDetailsSchema, imageFileSchema } from "@/lib/validation";

const blank = { provider: "", url: "", licence: "" };

describe("an image's words (D93)", () => {
  it("need what it shows, unless it is decorative, which keeps none", () => {
    expect(imageDetailsSchema.safeParse({ alt: " ", decorative: false, source: blank }).error?.issues[0]).toMatchObject(
      {
        message: VALIDATION_MESSAGES.required("Alt text"),
        path: ["alt"],
      },
    );
    expect(imageDetailsSchema.parse({ alt: "Ignored", decorative: true, source: blank })).toEqual({
      alt: null,
      decorative: true,
      source: null,
    });
    expect(
      imageDetailsSchema.safeParse({ alt: "x".repeat(TEXT_LIMITS.alt + 1), decorative: false, source: blank }).success,
    ).toBe(false);
  });

  it("keep where a stock photo came from when any part is given, its link https only", () => {
    expect(
      imageDetailsSchema.parse({ alt: "A nurse", decorative: false, source: { ...blank, provider: " Unsplash " } }),
    ).toEqual({ alt: "A nurse", decorative: false, source: { provider: "Unsplash", url: null, licence: null } });
    expect(
      imageDetailsSchema.parse({
        alt: "A nurse",
        decorative: false,
        source: { ...blank, url: "https://unsplash.com/x" },
      }).source,
    ).toEqual({ provider: null, url: "https://unsplash.com/x", licence: null });
    expect(
      imageDetailsSchema.safeParse({ alt: "A nurse", decorative: false, source: { ...blank, url: "http://x.example" } })
        .success,
    ).toBe(false);
    expect(
      imageDetailsSchema.parse({
        alt: "A nurse",
        decorative: false,
        source: { provider: null, url: null, licence: null },
      }).source,
    ).toBeNull();
  });
});

describe("an uploaded image", () => {
  it("is a file, said in the catalogue's words when there is none", () => {
    expect(imageFileSchema.safeParse(new File(["x"], "a.jpg")).success).toBe(true);
    expect(imageFileSchema.safeParse(null).error?.issues[0].message).toBe(VALIDATION_MESSAGES.required("The image"));
  });
});
