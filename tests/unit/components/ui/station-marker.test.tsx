import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StationMarker, stationClasses } from "@/components/ui/station-marker";

describe("StationMarker", () => {
  it("is decoration, filled in its line's colour where the visitor is", () => {
    const { container } = render(<StationMarker tone="sky" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass("bg-sky", "border-sky", "size-(--line-station)");
  });

  it("is ringed in the line's colour once passed, and plain before", () => {
    expect(stationClasses("deep", "passed")).toContain("border-deep bg-ground");
    expect(stationClasses("leaf", "stop")).toContain("border-rule bg-ground");
    const { container } = render(<StationMarker tone="leaf" state="stop" />);
    expect(container.firstChild).toHaveClass("border-rule");
  });
});
