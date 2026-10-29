import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactBandSection } from "@/components/sections/ContactBandSection";
import { UI_TEXT } from "@/constants/messages";
import { contentFixture, siteFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ContactBandSection", () => {
  it("ends the page on WhatsApp and a call, the number, the email and the hours written out", () => {
    const content = { ...contentFixture("CONTACT_BAND"), text: en("Message us at any hour.") };
    render(<ContactBandSection anchor="contact" content={content} site={siteFixture()} />);
    expect(screen.getByRole("region", { name: "Talk to us" })).toBeInTheDocument();
    expect(screen.getByText("Message us at any hour.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByText("+974 3130 6555")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "info@alhidaya.qa" })).toHaveAttribute("href", "mailto:info@alhidaya.qa");
    expect(screen.getByText("Available 24/7")).toBeInTheDocument();
  });

  it("keeps its words without the details, and the details without the hours", () => {
    const { rerender } = render(
      <ContactBandSection anchor="contact" content={contentFixture("CONTACT_BAND")} site={null} />,
    );
    expect(screen.getByRole("region", { name: "Talk to us" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    const site = siteFixture();
    rerender(
      <ContactBandSection
        anchor="contact"
        content={contentFixture("CONTACT_BAND")}
        site={{ ...site, contact: { ...site.contact, hours: en(null) } }}
      />,
    );
    expect(screen.queryByText("Available 24/7")).not.toBeInTheDocument();
  });
});
