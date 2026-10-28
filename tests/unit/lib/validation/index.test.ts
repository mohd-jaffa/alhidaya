import { describe, expect, it } from "vitest";

import * as validation from "@/lib/validation";

describe("the validation module", () => {
  it("offers the primitives and the schemas", () => {
    expect(Object.keys(validation).sort()).toEqual([
      "EMAIL",
      "forgotPasswordSchema",
      "optionalEmail",
      "optionalLine",
      "optionalLines",
      "optionalPhone",
      "requiredEmail",
      "requiredLine",
      "requiredLines",
      "requiredPhone",
      "resetPasswordSchema",
      "signInSchema",
    ]);
  });
});
