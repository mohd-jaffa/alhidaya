import { describe, expect, it } from "vitest";

import { countErrors } from "@/components/admin/editor/errors";

describe("countErrors", () => {
  it("count each marked field once, wherever it sits, and never look inside a field's element", () => {
    const errors = Object.assign([undefined, { content: { heading: { en: { message: "Heading is required." } } } }], {
      root: { message: "This page needs a visible “Form” section." },
    });
    expect(
      countErrors({
        sections: errors,
        seo: { title: { en: { message: "Too long.", ref: { focus: () => {} } } } },
      }),
    ).toBe(3);
    expect(countErrors({ ref: { message: "an element's own words" }, en: { message: "Too long." } })).toBe(1);
    expect(countErrors({})).toBe(0);
    expect(countErrors(undefined)).toBe(0);
  });
});
