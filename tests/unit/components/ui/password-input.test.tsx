import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";

describe("PasswordInput", () => {
  it("hides what is typed until asked, then shows it exactly as typed", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Password" required>
        <PasswordInput name="password" />
      </Field>,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocapitalize", "none");
    await user.type(input, "  Spaced Pass ");

    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.showPassword }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("  Spaced Pass ");
    expect(screen.getByRole("button", { name: ADMIN_TEXT.hidePassword })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.hidePassword }));
    expect(input).toHaveAttribute("type", "password");
  });
});
