import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IconChip } from "@/components/ui/icon-chip";

describe("IconChip (D97)", () => {
  it("is decoration in a round chip, pale by default", () => {
    const { container } = render(<IconChip name="heart" />);
    const chip = container.firstElementChild!;
    expect(chip).toHaveAttribute("aria-hidden", "true");
    expect(chip).toHaveClass("rounded-full", "bg-leaf-pale", "size-11");
    expect(chip.querySelector("svg")).toHaveClass("size-5");
  });

  it("sits among words at their size, or in the leaf or white where it must stand out", () => {
    const { container, rerender } = render(<IconChip name="globe" tone="leaf" size="inline" className="ms-1" />);
    expect(container.firstElementChild).toHaveClass("bg-leaf", "size-[1.05em]", "ms-1");
    expect(container.querySelector("svg")).toHaveClass("size-[0.62em]");
    rerender(<IconChip name="clock" tone="ground" size="lg" />);
    expect(container.firstElementChild).toHaveClass("bg-ground", "size-14");
  });
});
