import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "@/components/ui/icon-button";

describe("IconButton", () => {
  it("is a pictogram with its words for screen readers, at the touch size", async () => {
    const onClick = vi.fn();
    render(<IconButton label="Move up: Values" pictogram="chevronUp" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Move up: Values" });
    expect(button).toHaveClass("size-touch");
    expect(button).not.toHaveAttribute("aria-disabled");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("stays focusable when it no longer applies, saying so, and does nothing", async () => {
    const onClick = vi.fn();
    render(<IconButton label="Move up: Values" pictogram="chevronUp" unavailable onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Move up: Values" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
