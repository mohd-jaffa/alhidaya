import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignSection } from "@/components/sections/SignSection";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture, siteFixture } from "@tests/support/fixtures/content";

const content = { ...contentFixture("SIGN"), highlight: { en: "at your doorstep" } };

describe("SignSection", () => {
  it.each(["ABOUT", "SERVICES"] as const)("keeps %s's actions hidden for off and legacy values (D156)", (page) => {
    const { rerender } = render(
      <SignSection page={page} anchor="start" content={content} image={null} site={siteFixture()} />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    const legacy = { ...content };
    delete legacy.showActions;
    rerender(<SignSection page={page} anchor="start" content={legacy} image={null} site={siteFixture()} />);
    expect(screen.queryByRole("link")).toBeNull();
  });
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

  it("opens every other page in Theme 6's straight lines, its phrase in deep blue (D135)", () => {
    const { container } = render(
      <SignSection page="SERVICES" anchor="start" content={content} image={imageFixture()} site={siteFixture()} />,
    );
    expect(container.querySelector("section")).toHaveClass("border-t");
    expect(container.querySelector("section")).toHaveClass("opening-blend");
    expect(container.querySelector(".bg-leaf-pale")).toBeNull();
    expect([...container.querySelectorAll("h1 .text-deep")].map((word) => word.textContent).join(" ")).toBe(
      "at your doorstep",
    );
  });

  it("on About and Services, offers WhatsApp and a quote", () => {
    render(
      <SignSection
        page="ABOUT"
        anchor="start"
        content={{ ...content, showActions: true }}
        image={null}
        site={siteFixture()}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/97431306555"),
    );
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
  });

  it("on Contact, opens on the white type-led composition with channels in the next section", () => {
    render(<SignSection page="CONTACT" anchor="start" content={content} image={null} site={siteFixture()} />);
    expect(screen.getByRole("heading", { level: 1, name: content.headline.en })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("offers nothing to reach the company before its numbers are published", () => {
    render(
      <SignSection page="ABOUT" anchor="start" content={{ ...content, showActions: true }} image={null} site={null} />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
