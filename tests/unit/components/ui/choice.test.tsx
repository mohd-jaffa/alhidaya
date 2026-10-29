import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checkbox, RadioGroup } from "@/components/ui/choice";
import { UI_TEXT } from "@/constants/messages";

const OPTIONS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "CALL", label: "A call" },
];

describe("RadioGroup", () => {
  it("asks its question as a group, each answer a labelled radio", async () => {
    render(<RadioGroup legend="Preferred contact" name="contact" options={OPTIONS} required />);
    const group = screen.getByRole("group", { name: "Preferred contact" });
    const call = screen.getByRole("radio", { name: "A call" });
    expect(group).toContainElement(call);
    expect(call).toBeRequired();
    await userEvent.click(screen.getByText("A call"));
    expect(call).toBeChecked();
    expect(group).not.toHaveAttribute("aria-describedby");
  });

  it("ties its error to the group", () => {
    render(<RadioGroup legend="Where are you now?" name="where" options={OPTIONS} error="Please choose one." />);
    expect(screen.getByRole("group", { name: `Where are you now? (${UI_TEXT.optional})` })).toHaveAccessibleDescription(
      "Please choose one.",
    );
    expect(screen.getByRole("radio", { name: "WhatsApp" })).toHaveAttribute("data-invalid");
  });
});

describe("Checkbox", () => {
  it("is ticked by its words, and carries its error", async () => {
    render(
      <Checkbox name="consent" error="Please agree to the privacy notice.">
        I agree to the privacy notice.
      </Checkbox>,
    );
    const box = screen.getByRole("checkbox", { name: "I agree to the privacy notice." });
    expect(box).toHaveAccessibleDescription("Please agree to the privacy notice.");
    expect(box).toHaveAttribute("aria-invalid", "true");
    await userEvent.click(screen.getByText("I agree to the privacy notice."));
    expect(box).toBeChecked();
  });

  it("stands alone when nothing is wrong", () => {
    render(<Checkbox name="news">Keep me posted</Checkbox>);
    expect(screen.getByRole("checkbox", { name: "Keep me posted" })).not.toHaveAttribute("aria-describedby");
  });
});
