import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field, useFieldControl } from "@/components/ui/field";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { UI_TEXT } from "@/constants/messages";

describe("Field", () => {
  it("labels its control, and describes it by its hint and its error", () => {
    render(
      <Field label="Phone" hint="A Qatar number." error="Phone must be a Qatar number." required>
        <TextInput name="phone" type="tel" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Phone" });
    expect(input).toHaveAccessibleDescription("A Qatar number. Phone must be a Qatar number.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    expect(screen.getByText("Phone must be a Qatar number.").closest("p")).toHaveClass("text-error");
  });

  it("keeps a label for screen readers alone when it is already in view beside the control", () => {
    render(
      <Field label="Paragraph 2" required hideLabel>
        <TextArea name="paragraph" />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Paragraph 2" })).toBeVisible();
    expect(screen.getByText("Paragraph 2")).toHaveClass("sr-only");
  });

  it("leaves out the optional mark where it would say nothing useful, as on a search box", () => {
    render(
      <Field label="Search" markOptional={false}>
        <TextInput name="q" />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Search" })).not.toBeRequired();
  });

  it("leaves a valid, optional control undescribed", () => {
    render(
      <Field label="Organisation">
        <TextInput name="organisation" className="uppercase" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: `Organisation (${UI_TEXT.optional})` });
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toBeRequired();
    expect(input).toHaveClass("uppercase", "min-h-12");
  });

  it("holds several lines of text", () => {
    render(
      <Field label="Message">
        <TextArea name="message" className="h-40" />
      </Field>,
    );
    const area = screen.getByRole("textbox", { name: `Message (${UI_TEXT.optional})` });
    expect(area.tagName).toBe("TEXTAREA");
    expect(area).toHaveAttribute("rows", "5");
    expect(area).toHaveClass("h-40");
  });

  it("refuses a control used outside a field", () => {
    function Loose() {
      useFieldControl();
      return null;
    }
    expect(() => render(<Loose />)).toThrow("A form control is used outside a Field.");
  });
});
