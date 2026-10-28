import { describe, expect, it } from "vitest";

import * as validation from "@/lib/validation";

describe("the validation module", () => {
  it("offers the primitives every schema is built from", () => {
    expect(Object.keys(validation).sort()).toEqual([
      "EMAIL",
      "optionalEmail",
      "optionalLine",
      "optionalLines",
      "optionalPhone",
      "requiredEmail",
      "requiredLine",
      "requiredLines",
      "requiredPhone",
    ]);
  });
});
