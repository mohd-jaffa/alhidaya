import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactDetailsSection } from "@/components/sections/ContactDetailsSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, siteFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ContactDetailsSection", () => {
  it("lists every way to reach the company, the office with the way to it, and the hours", () => {
    render(
      <ContactDetailsSection anchor="reach-us" content={contentFixture("CONTACT_DETAILS")} site={siteFixture()} />,
    );
    expect(screen.getByRole("region", { name: "Contact" })).toBeInTheDocument();
    for (const term of [UI_TEXT.whatsapp, UI_TEXT.phone, UI_TEXT.email, UI_TEXT.address, UI_TEXT.hours])
      expect(screen.getByText(term, { selector: "dt" })).toBeInTheDocument();
    const [whatsapp, phone] = screen.getAllByRole("link", { name: "+974 3130 6555" });
    expect(whatsapp).toHaveAttribute("href", expect.stringContaining("https://wa.me/97431306555"));
    expect(phone).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByText("Retaj Building, Al Sadd, Doha")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.openInMaps })).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=Retaj+Building+Al+Sadd",
    );
    expect(screen.queryByRole("link", { name: UI_TEXT.downloadBrochure })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: UI_TEXT.mapLabel })).toBeInTheDocument();
  });

  it("offers the brochure when there is one, leaves out hours not given, and waits for published details", () => {
    const site = siteFixture({ brochure: { mediaId: crypto.randomUUID() } });
    const { rerender } = render(
      <ContactDetailsSection
        anchor="reach-us"
        content={contentFixture("CONTACT_DETAILS")}
        site={{ ...site, contact: { ...site.contact, hours: en(null) } }}
      />,
    );
    expect(screen.getByRole("link", { name: UI_TEXT.downloadBrochure })).toHaveAttribute("href", ROUTES.brochure);
    expect(screen.queryByText(UI_TEXT.hours, { selector: "dt" })).not.toBeInTheDocument();

    rerender(<ContactDetailsSection anchor="reach-us" content={contentFixture("CONTACT_DETAILS")} site={null} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
