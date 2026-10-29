import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignSection } from "@/components/sections/SignSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture, siteFixture } from "@tests/support/fixtures/content";

describe("SignSection", () => {
  it("opens the page with its headline and its photo, fetched first", () => {
    const { container } = render(
      <SignSection anchor="start" content={contentFixture("SIGN")} image={imageFixture()} site={null} />,
    );
    expect(container.firstElementChild).toHaveAttribute("id", "start");
    expect(screen.getByRole("heading", { level: 1, name: "Nursing care, at your doorstep" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "A nurse at a patient's bedside" })).toHaveAttribute(
      "fetchpriority",
      "high",
    );
    expect(screen.queryByText(UI_TEXT.youAreHere)).not.toBeInTheDocument();
  });

  it("on Home, starts the three lines from where the visitor stands, with their working actions", () => {
    render(<SignSection anchor="start" content={contentFixture("SIGN")} image={null} site={siteFixture()} withLines />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(UI_TEXT.youAreHere)).toBeInTheDocument();
    for (const name of [UI_TEXT.lineCareAtHome, UI_TEXT.lineStaffing, UI_TEXT.lineCareers])
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/97431306555"),
    );
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
    expect(screen.getByRole("link", { name: UI_TEXT.careers })).toHaveAttribute("href", ROUTES.careers);
  });

  it("keeps the lines when the site's numbers are not published, without the calls", () => {
    render(<SignSection anchor="start" content={contentFixture("SIGN")} image={null} site={null} withLines />);
    expect(screen.getByRole("heading", { name: UI_TEXT.lineCareAtHome })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.whatsapp })).not.toBeInTheDocument();
  });
});
