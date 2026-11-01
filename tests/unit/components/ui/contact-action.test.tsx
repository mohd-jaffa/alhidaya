import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactAction } from "@/components/ui/contact-action";
import { UI_TEXT } from "@/constants/messages";

describe("ContactAction", () => {
  it("opens WhatsApp with the first line written, as a round action with an arrow (D97)", () => {
    render(<ContactAction kind="whatsapp" to="+97431306555" variant="line" size="lg" arrow className="w-full" />);
    const link = screen.getByRole("link", { name: UI_TEXT.whatsapp });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/97431306555\?text=Hello/);
    expect(link).toHaveClass("ring-deep", "rounded-button", "w-full", "min-h-13");
    expect(link.querySelector("svg")).toBeInTheDocument();
  });

  it("calls and emails, in deep blue unless told otherwise, with no arrow", () => {
    render(
      <>
        <ContactAction kind="call" to="+97431306555" />
        <ContactAction kind="email" to="info@alhidaya.qa" />
      </>,
    );
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveClass("bg-deep");
    expect(screen.getByRole("link", { name: UI_TEXT.call }).querySelector("svg")).toBeNull();
    expect(screen.getByRole("link", { name: UI_TEXT.email })).toHaveAttribute("href", "mailto:info@alhidaya.qa");
  });
});
