import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AudienceActions } from "@/components/sections/AudienceActions";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { siteFixture } from "@tests/support/fixtures/content";

describe("AudienceActions", () => {
  it("offers a family WhatsApp and a call", () => {
    render(<AudienceActions audience="FAMILIES" site={siteFixture()} size="lg" />);
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/97431306555"),
    );
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
  });

  it("offers a family nothing before the numbers are published", () => {
    const { container } = render(<AudienceActions audience="FAMILIES" site={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks an institution for a quote, for the service already chosen when there is one", () => {
    const { rerender } = render(<AudienceActions audience="INSTITUTIONS" site={null} />);
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
    rerender(<AudienceActions audience="INSTITUTIONS" site={null} service="school-nurse-staffing" />);
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute(
      "href",
      ROUTES.quoteFor("school-nurse-staffing"),
    );
  });
});
