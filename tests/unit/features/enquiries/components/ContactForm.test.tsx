import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ContactForm } from "@/features/enquiries/components/ContactForm";

const { submit } = vi.hoisted(() => ({ submit: vi.fn(async () => ({ received: true })) }));
vi.mock("@/features/enquiries/api.client", () => ({ EnquiriesClient: { submit } }));

const field = (label: string) => screen.getByRole("textbox", { name: label });

describe("ContactForm (plan §10.2)", () => {
  it("asks for a name, phone, email and message, each checked by the Contact schema", async () => {
    const user = userEvent.setup();
    render(<ContactForm whatsapp="+97431306555" />);
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendMessage }));
    await waitFor(() =>
      expect(field(UI_TEXT.yourName)).toHaveAccessibleDescription(VALIDATION_MESSAGES.required(UI_TEXT.yourName)),
    );
    expect(field(UI_TEXT.phone)).toHaveAccessibleDescription(
      `${UI_TEXT.phoneHint} ${VALIDATION_MESSAGES.required(UI_TEXT.phone)}`,
    );
    expect(field(UI_TEXT.email)).toHaveAttribute("type", "email");
    expect(field(UI_TEXT.message)).toHaveAttribute("maxlength", "2000");
    expect(submit).not.toHaveBeenCalled();
  });

  it("sends the message as a Contact enquiry, as typed", async () => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    render(<ContactForm whatsapp={null} />);
    await user.type(field(UI_TEXT.yourName), "Mariam Ali");
    await user.type(field(UI_TEXT.phone), "5551 2345");
    await user.type(field(UI_TEXT.email), "mariam@example.com");
    await user.type(field(UI_TEXT.message), "A nurse at night?");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendMessage }));
    expect(await screen.findByRole("group", { name: UI_TEXT.messageSent })).toHaveFocus();
    expect(submit).toHaveBeenCalledWith("CONTACT", {
      name: "Mariam Ali",
      phone: "5551 2345",
      email: "mariam@example.com",
      message: "A nurse at night?",
      consent: true,
    });
  });
});
