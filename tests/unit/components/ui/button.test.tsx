import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";

describe("Button", () => {
  it("is a button that presses in, primary by default, at the touch size", () => {
    render(<Button>Send message</Button>);
    const button = screen.getByRole("button", { name: "Send message" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-deep", "text-on-deep", "min-h-touch", "active:scale-[0.98]");
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("stays in place and refuses a second press while it is busy", () => {
    render(
      <Button type="submit" pending variant="secondary" size="lg" pictogram="download">
        Sending
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Sending" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("border-navy", "min-h-14");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("can be disabled on its own", () => {
    render(<Button disabled>Unavailable</Button>);
    expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  });

  it("is deep blue, outlined or quiet, and takes classes of its own last", () => {
    expect(buttonClasses({})).toContain("bg-deep text-on-deep");
    expect(buttonClasses({ variant: "secondary" })).toContain("border-navy");
    expect(buttonClasses({}, "w-full")).toMatch(/w-full$/);
    expect(buttonClasses({ variant: "quiet" })).toContain("text-deep hover:bg-mist");
  });
});

describe("ButtonLink", () => {
  it("goes to a page of this site through Next's link", () => {
    render(<ButtonLink href="/request-a-quote">Request a quote</ButtonLink>);
    const link = screen.getByRole("link", { name: "Request a quote" });
    expect(link).toHaveAttribute("href", "/request-a-quote");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens another site in a new tab, and calls in place", () => {
    render(
      <>
        <ButtonLink href="https://wa.me/97431306555" variant="secondary" pictogram="chat">
          WhatsApp
        </ButtonLink>
        <ButtonLink href="tel:+97431306555">Call</ButtonLink>
      </>,
    );
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Call" })).not.toHaveAttribute("target");
  });
});
