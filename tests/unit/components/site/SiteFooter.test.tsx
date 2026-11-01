import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/site/SiteFooter";
import { UI_TEXT } from "@/constants/messages";
import { dohaDay } from "@/lib/dates";
import { siteFixture } from "@tests/support/fixtures/content";

describe("SiteFooter", () => {
  it("lists the admin's columns under bold headings, plain contact details and each social network with its mark", () => {
    render(<SiteFooter site={siteFixture({ brochure: { mediaId: crypto.randomUUID() } })} />);
    const company = screen.getByRole("navigation", { name: "Company" });
    expect(within(company).getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(within(company).getByRole("heading", { level: 2, name: "Company" })).toHaveClass("font-semibold");
    // The address is on the Contact page; the footer keeps to the phone, the email and the hours.
    expect(screen.queryByText("Retaj Building, Al Sadd, Doha")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+974 3130 6555" })).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByRole("link", { name: "info@alhidaya.qa" })).toHaveAttribute("href", "mailto:info@alhidaya.qa");
    expect(screen.getByText("Available 24/7")).toBeInTheDocument();
    const social = screen.getByRole("list", { name: UI_TEXT.followUs });
    const instagram = within(social).getByRole("link", { name: "Instagram" });
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    // The brochure is the header's to offer (D116), not the footer's.
    expect(screen.queryByRole("link", { name: UI_TEXT.brochure })).not.toBeInTheDocument();
    // Soft white under a rule, the logo in its own colours (D132).
    expect(screen.getByRole("img", { name: UI_TEXT.siteName }).getAttribute("src")).not.toMatch(/logo-(navy|white)/);
    expect(screen.getByRole("contentinfo")).toHaveClass("bg-ground", "border-t");
    expect(screen.queryByRole("link", { name: UI_TEXT.requestQuote })).not.toBeInTheDocument();
  });

  it("leaves out what the admin left empty", () => {
    render(
      <SiteFooter
        site={siteFixture({
          social: [],
          contact: { ...siteFixture().contact, hours: { en: null } },
        })}
      />,
    );
    expect(screen.queryByRole("list", { name: UI_TEXT.followUs })).not.toBeInTheDocument();
    expect(screen.queryByText("Available 24/7")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.brochure })).not.toBeInTheDocument();
  });

  it("still closes the page, with the logo and the year in Doha, before the site content is published", () => {
    render(<SiteFooter site={null} />);
    expect(
      screen.getByText(`© ${dohaDay().slice(0, 4)} ${UI_TEXT.legalName} ${UI_TEXT.copyright}`),
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
