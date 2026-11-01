import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactBandSection } from "@/components/sections/ContactBandSection";
import { UI_TEXT } from "@/constants/messages";
import { contentFixture, siteFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ContactBandSection", () => {
  it("ends the page on Home's pale-green band, WhatsApp, a call at any hour and the email beside its words (D135)", () => {
    const content = { ...contentFixture("CONTACT_BAND"), text: en("Message us at any hour.") };
    render(<ContactBandSection anchor="contact" content={content} site={siteFixture()} />);
    const band = screen.getByRole("region", { name: "Talk to us" });
    expect(band).toHaveClass("bg-leaf-pale");
    expect(screen.getByText("Message us at any hour.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(UI_TEXT.whatsappUs) })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me"),
    );
    expect(screen.getByRole("link", { name: new RegExp(UI_TEXT.callUs247) })).toHaveAttribute(
      "href",
      "tel:+97431306555",
    );
    expect(screen.getByRole("link", { name: new RegExp(UI_TEXT.emailUs) })).toHaveAttribute(
      "href",
      "mailto:info@alhidaya.qa",
    );
  });

  it("keeps its words without the details", () => {
    render(<ContactBandSection anchor="contact" content={contentFixture("CONTACT_BAND")} site={null} />);
    expect(screen.getByRole("region", { name: "Talk to us" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
