import { describe, expect, it } from "vitest";

import { pillClasses } from "@/components/ui/pill-classes";

describe("pillClasses (D132)", () => {
  it("is the deep-blue button by default, white-worded, with rounded corners at the touch size", () => {
    expect(pillClasses({})).toMatch(/rounded-button.*bg-deep text-on-deep.*min-h-touch/);
  });

  it("builds the look from the variant and size, keeping a caller's own classes last", () => {
    expect(pillClasses({ variant: "onLeaf", size: "lg" }, "w-full")).toMatch(/bg-ground.*min-h-13.*w-full$/);
    expect(pillClasses({ variant: "onLeafQuiet" })).toContain("border-on-leaf text-on-leaf");
    expect(pillClasses({ variant: "line" })).toContain("text-deep ring-[1.5px] ring-deep");
  });
});
