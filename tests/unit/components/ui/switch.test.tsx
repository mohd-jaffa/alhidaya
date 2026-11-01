import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Switch } from "@/components/ui/switch";
import { ADMIN_TEXT } from "@/constants/admin-messages";

describe("Switch", () => {
  it("is a switch named by its words alone, turned on and off by a click on them (D134)", async () => {
    render(<Switch name="shown">Shown in the menu</Switch>);
    const toggle = screen.getByRole("switch", { name: "Shown in the menu" });
    expect(toggle).not.toBeChecked();
    expect(toggle).toHaveAttribute("name", "shown");
    await userEvent.click(screen.getByText("Shown in the menu"));
    expect(toggle).toBeChecked();
  });

  it("says Enabled or Disabled beside its pill, in words, which its state shows one at a time", () => {
    render(<Switch defaultChecked>WhatsApp button</Switch>);
    expect(screen.getByText(ADMIN_TEXT.enabled)).toHaveClass("group-has-checked:inline");
    expect(screen.getByText(ADMIN_TEXT.disabled)).toHaveClass("group-has-checked:hidden");
    expect(screen.getByRole("switch")).toBeChecked();
  });
});
