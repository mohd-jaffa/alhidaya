import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/site/SiteFooter";
import { UI_TEXT } from "@/constants/messages";
import { dohaDay } from "@/lib/dates";
import { siteFixture } from "@tests/support/fixtures/content";

describe("SiteFooter", () => {
  it("lists the admin's columns, the contact details and the social links", () => {
    render(<SiteFooter site={siteFixture({ brochure: { mediaId: crypto.randomUUID() } })} />);
    const company = screen.getByRole("navigation", { name: "Company" });
    expect(within(company).getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByText("Retaj Building, Al Sadd, Doha")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+974 3130 6555" })).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByRole("link", { name: "info@alhidaya.qa" })).toHaveAttribute("href", "mailto:info@alhidaya.qa");
    expect(screen.getByText("Available 24/7")).toBeInTheDocument();
    const social = screen.getByRole("list", { name: UI_TEXT.followUs });
    expect(within(social).getByRole("link", { name: "Instagram" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: UI_TEXT.brochure })).toHaveAttribute("href", "/brochure");
    expect(screen.getByRole("img", { name: UI_TEXT.siteName }).getAttribute("src")).toMatch(/logo-white/);
  });

  it("leaves out what the admin left empty", () => {
    render(
      <SiteFooter site={siteFixture({ social: [], contact: { ...siteFixture().contact, hours: { en: null } } })} />,
    );
    expect(screen.queryByRole("list", { name: UI_TEXT.followUs })).not.toBeInTheDocument();
    expect(screen.queryByText("Available 24/7")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.brochure })).not.toBeInTheDocument();
  });

  it("still closes the page, with the logo and the year in Doha, before the site content is published", () => {
    render(<SiteFooter site={null} />);
    expect(screen.getByText(new RegExp(`© ${dohaDay().slice(0, 4)} ${UI_TEXT.siteName}`))).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
