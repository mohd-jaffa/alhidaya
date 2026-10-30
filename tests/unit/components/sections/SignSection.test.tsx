import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignSection } from "@/components/sections/SignSection";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture, siteFixture } from "@tests/support/fixtures/content";

const content = { ...contentFixture("SIGN"), highlight: { en: "at your doorstep" } };

describe("SignSection", () => {
  it("opens the page on its name, its headline with the highlighted words, and its photo, fetched first", () => {
    const { container } = render(
      <SignSection page="CAREERS" anchor="start" content={content} image={imageFixture()} site={siteFixture()} />,
    );
    expect(container.firstElementChild).toHaveAttribute("id", "start");
    expect(screen.getByText(PAGE_NAMES.CAREERS)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Nursing care, at your doorstep" })).toBeInTheDocument();
    expect(container.querySelector(".bg-leaf-pale.box-decoration-clone")).toHaveTextContent("at your doorstep");
    expect(screen.getByRole("img", { name: "A nurse at a patient's bedside" })).toHaveAttribute(
      "fetchpriority",
      "high",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("on About and Services, offers WhatsApp and a quote", () => {
    render(<SignSection page="ABOUT" anchor="start" content={content} image={null} site={siteFixture()} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/97431306555"),
    );
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
  });

  it("on Contact, offers WhatsApp and a call", () => {
    render(<SignSection page="CONTACT" anchor="start" content={content} image={null} site={siteFixture()} />);
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
  });

  it("offers nothing to reach the company before its numbers are published", () => {
    render(<SignSection page="ABOUT" anchor="start" content={content} image={null} site={null} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
