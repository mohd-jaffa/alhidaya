import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { UI_TEXT } from "@/constants/messages";
import { siteFixture } from "@tests/support/fixtures/content";

describe("FloatingWhatsApp", () => {
  it("floats a WhatsApp chat, its first line written, on every page (plan D67)", () => {
    render(<FloatingWhatsApp site={siteFixture()} />);
    const link = screen.getByRole("link", { name: UI_TEXT.whatsappButton });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/97431306555\?text=Hello/);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveClass("fixed");
  });

  it("is gone when the admin turns it off, or before the site content is published", () => {
    const { container } = render(<FloatingWhatsApp site={siteFixture({ whatsappButton: false })} />);
    expect(container).toBeEmptyDOMElement();
    const { container: unpublished } = render(<FloatingWhatsApp site={null} />);
    expect(unpublished).toBeEmptyDOMElement();
  });
});
