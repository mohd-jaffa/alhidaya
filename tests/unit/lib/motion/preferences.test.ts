import { describe, expect, it } from "vitest";

import { REDUCED_MOTION_QUERY, WHEEL_QUERY } from "@/lib/motion/preferences";

describe("the motion preferences", () => {
  it("ask for reduced motion and for a hovering, fine pointer (a wheel), never for touch", () => {
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
    expect(WHEEL_QUERY).toBe("(hover: hover) and (pointer: fine)");
  });
});
