import { describe, expect, it } from "vitest";

import { sectionAnchors } from "@/components/sections/anchors";

describe("sectionAnchors", () => {
  it("names each section by its type, numbering a type used again", () => {
    expect(
      sectionAnchors([{ type: "SIGN" }, { type: "RICH_TEXT" }, { type: "CONTACT_BAND" }, { type: "RICH_TEXT" }]),
    ).toEqual(["start", "text", "contact", "text-2"]);
  });
});
