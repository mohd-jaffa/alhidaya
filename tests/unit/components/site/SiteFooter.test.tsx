import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(within(company).getByRole("heading", { level: 2, name: "Company" })).toHaveClass(
      "text-title",
      "font-semibold",
    );
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
    expect(screen.getByRole("img", { name: UI_TEXT.siteName }).getAttribute("src")).toMatch(/logo-navy/);
    expect(screen.queryByRole("link", { name: UI_TEXT.requestQuote })).not.toBeInTheDocument();
  });

  it("runs the admin's words across its top in a loop for the eye alone, with a button to pause them (D106, D113)", async () => {
    const { container } = render(<SiteFooter site={siteFixture()} />);
    const words = screen.getAllByText("AL HIDAYA HEALTH CARE");
    // Four copies, moved by two: a loop with no seam.
    expect(words).toHaveLength(4);
    const run = words[0].parentElement!;
    expect(run).toHaveClass("running-words");
    // The band that holds the words and their button: checked, it pauses them (globals.css).
    expect(run.parentElement!.parentElement).toHaveClass("running-band");
    expect(run.parentElement).toHaveAttribute("aria-hidden", "true");
    expect(run.parentElement).toHaveClass("overflow-hidden");
    expect(container.firstElementChild).toHaveClass("bg-leaf");

    const pause = screen.getByRole("checkbox", { name: UI_TEXT.pauseRunningWords });
    expect(pause).not.toBeChecked();
    await userEvent.click(pause);
    expect(pause).toBeChecked();
    expect(pause.closest("label")).toHaveClass("motion-reduce:hidden");
  });

  it("leaves out what the admin left empty", () => {
    render(
      <SiteFooter
        site={siteFixture({
          social: [],
          contact: { ...siteFixture().contact, hours: { en: null } },
          runningWords: { en: null },
        })}
      />,
    );
    expect(screen.queryByRole("list", { name: UI_TEXT.followUs })).not.toBeInTheDocument();
    expect(screen.queryByText("Available 24/7")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.brochure })).not.toBeInTheDocument();
    expect(screen.queryByText("AL HIDAYA HEALTH CARE")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("still closes the page, with the logo and the year in Doha, before the site content is published", () => {
    render(<SiteFooter site={null} />);
    expect(
      screen.getByText(`© ${dohaDay().slice(0, 4)} ${UI_TEXT.legalName} ${UI_TEXT.copyright}`),
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
