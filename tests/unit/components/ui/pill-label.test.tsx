import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PillLabel } from "@/components/ui/pill-label";

describe("PillLabel (D97, D105)", () => {
  it("names who a section speaks to on a pale-green pill", () => {
    render(<PillLabel>For families</PillLabel>);
    expect(screen.getByText("For families")).toHaveClass("rounded-pill", "bg-leaf-pale", "text-forest");
  });
});
