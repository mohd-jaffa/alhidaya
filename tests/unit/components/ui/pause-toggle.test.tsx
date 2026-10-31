import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PauseToggle } from "@/components/ui/pause-toggle";

describe("PauseToggle (D113, D124)", () => {
  it("is a checkbox named for what it stops, drawn as a pause and then a play", async () => {
    const { container } = render(<PauseToggle label="Pause the moving words" tone="leaf" className="absolute" />);
    const pause = screen.getByRole("checkbox", { name: "Pause the moving words" });
    await userEvent.click(pause);
    expect(pause).toBeChecked();
    expect(container.firstElementChild).toHaveClass("border-on-leaf/40", "absolute", "motion-reduce:hidden");
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("draws in the rule's line on white or mist", () => {
    const { container } = render(<PauseToggle label="Pause the moving steps" tone="ground" />);
    expect(container.firstElementChild).toHaveClass("border-rule", "text-navy");
  });
});
