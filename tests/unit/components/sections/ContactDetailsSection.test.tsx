import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContactDetailsSection } from "@/components/sections/ContactDetailsSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, siteFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

const en = <T,>(value: T) => ({ en: value });

describe("ContactDetailsSection", () => {
  it("lists each contact channel and the published hours on the ribbon", () => {
    render(
      <ContactDetailsSection anchor="reach-us" content={contentFixture("CONTACT_DETAILS")} site={siteFixture()} />,
    );
    expect(screen.getByRole("region", { name: "Contact" })).toHaveClass("bg-deep", "text-on-deep");
    for (const term of [UI_TEXT.whatsapp, UI_TEXT.phone, UI_TEXT.email]) {
      expect(screen.getByText(term, { selector: "dt" })).toBeInTheDocument();
      expect(screen.getByText(term, { selector: "dt" })).toHaveClass("font-bold");
      expect(screen.getByText(term, { selector: "dt" }).parentElement).toHaveClass("bg-card", "rounded-card");
    }
    const [whatsapp, phone] = screen.getAllByRole("link", { name: "+974 3130 6555" });
    expect(whatsapp).toHaveAttribute("href", expect.stringContaining("https://wa.me/97431306555"));
    expect(phone).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByText(siteFixture().contact.hours.en!)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.downloadBrochure })).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
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
    expect(screen.queryByText(siteFixture().contact.hours.en!)).not.toBeInTheDocument();

    rerender(<ContactDetailsSection anchor="reach-us" content={contentFixture("CONTACT_DETAILS")} site={null} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
