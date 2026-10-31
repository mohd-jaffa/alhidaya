import { describe, expect, it } from "vitest";

import { pillClasses } from "@/components/ui/pill-classes";

describe("pillClasses (D97)", () => {
  it("is a leaf pill by default, navy-worded (D122), at the touch size", () => {
    expect(pillClasses({})).toMatch(/rounded-pill.*bg-leaf text-on-leaf.*min-h-touch/);
  });

  it("builds the look from the variant and size, keeping a caller's own classes last", () => {
    expect(pillClasses({ variant: "onLeaf", size: "lg" }, "w-full")).toMatch(/bg-ground.*min-h-13.*w-full$/);
    expect(pillClasses({ variant: "onLeafQuiet" })).toContain("border-on-leaf text-on-leaf");
    expect(pillClasses({ variant: "pale" })).toContain("bg-leaf-pale text-forest");
  });
});
