import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pill, PillLink } from "@/components/ui/pill";

describe("the round actions (D97)", () => {
  it("press as buttons, held while pending, in the leaf by default", async () => {
    const pressed = vi.fn();
    const { rerender } = render(<Pill onClick={pressed}>Send</Pill>);
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toContain("bg-leaf");
    await userEvent.click(button);
    expect(pressed).toHaveBeenCalledOnce();

    rerender(
      <Pill variant="pale" type="submit" pending arrow onClick={pressed}>
        Send
      </Pill>,
    );
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send" }).className).toContain("bg-leaf-pale");
  });

  it("go to a page of the site, another site in a new tab, or a call where they are", () => {
    render(
      <>
        <PillLink href="/request-a-quote" arrow>
          Request a quote
        </PillLink>
        <PillLink href="https://wa.me/97431306555" variant="onLeaf">
          WhatsApp us
        </PillLink>
        <PillLink href="tel:+97431306555" size="lg">
          Call
        </PillLink>
      </>,
    );
    const quote = screen.getByRole("link", { name: "Request a quote" });
    expect(quote).toHaveAttribute("href", "/request-a-quote");
    expect(quote.querySelector("svg")).not.toBeNull();
    const whatsapp = screen.getByRole("link", { name: "WhatsApp us" });
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Call" })).not.toHaveAttribute("target");
  });
});
