import { describe, expect, it } from "vitest";

import { pillClasses } from "@/components/ui/pill-classes";

describe("pillClasses (D97)", () => {
  it("is a forest pill by default, at the touch size", () => {
    expect(pillClasses({})).toMatch(/rounded-pill.*bg-forest text-on-forest.*min-h-touch/);
  });

  it("builds the look from the variant and size, keeping a caller's own classes last", () => {
    expect(pillClasses({ variant: "onForest", size: "lg" }, "w-full")).toMatch(/bg-ground.*min-h-13.*w-full$/);
    expect(pillClasses({ variant: "onForestQuiet" })).toContain("border-on-forest text-on-forest");
    expect(pillClasses({ variant: "pale" })).toContain("bg-leaf-pale text-forest");
  });
});
