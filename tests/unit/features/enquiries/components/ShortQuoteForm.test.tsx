import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ShortQuoteForm } from "@/features/enquiries/components/ShortQuoteForm";

const { submit } = vi.hoisted(() => ({ submit: vi.fn(async () => ({ received: true })) }));
vi.mock("@/features/enquiries/form.client", () => ({ EnquiryFormClient: { submit } }));
vi.mock("@/components/ui/bot-check", () => ({
  BotCheck: () => <input type="hidden" name="turnstileToken" value="token-from-cloudflare" readOnly />,
}));

const SERVICES = [{ slug: "home-nursing-care", name: "Home nursing care" }];
const field = (label: string) => screen.getByRole("textbox", { name: label });

describe("ShortQuoteForm (D130)", () => {
  it("asks the name, mobile, email, service and message, two to a row, the message across", async () => {
    const user = userEvent.setup();
    render(<ShortQuoteForm services={SERVICES} whatsapp={null} siteKey="site-key" />);
    expect(field(UI_TEXT.yourName).closest(".sm\\:grid-cols-2")).not.toBeNull();
    expect(field(UI_TEXT.message)).toHaveAttribute("placeholder", UI_TEXT.shortQuoteMessageHint);
    expect(field(UI_TEXT.yourName)).toHaveAttribute("placeholder", UI_TEXT.fullName);
    expect(field(UI_TEXT.mobile)).toHaveAttribute("placeholder", UI_TEXT.countryCodePlaceholder);
    expect(field(UI_TEXT.email)).toHaveAttribute("placeholder", UI_TEXT.emailPlaceholder);
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendShortQuote }));
    expect(await screen.findByText(VALIDATION_MESSAGES.required(UI_TEXT.yourName))).toBeVisible();
  });

  it("sends the request as a short quote, as typed", async () => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    render(<ShortQuoteForm services={SERVICES} whatsapp="+97431306555" siteKey="site-key" />);
    await user.type(field(UI_TEXT.yourName), "Aisha");
    await user.type(field(UI_TEXT.mobile), "5551 2345");
    await user.type(field(UI_TEXT.email), "aisha@example.com");
    await user.selectOptions(screen.getByRole("combobox"), "home-nursing-care");
    await user.type(field(UI_TEXT.message), "A nurse at night.");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendShortQuote }));
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith("SHORT_QUOTE", {
        name: "Aisha",
        phone: "5551 2345",
        email: "aisha@example.com",
        service: "home-nursing-care",
        message: "A nurse at night.",
        consent: true,
        your_reference: "",
        turnstileToken: "token-from-cloudflare",
      }),
    );
    expect(await screen.findByRole("group", { name: UI_TEXT.quoteSent })).toBeInTheDocument();
  });
});
