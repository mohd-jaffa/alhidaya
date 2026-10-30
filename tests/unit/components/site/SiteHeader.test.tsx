import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "@/components/site/SiteHeader";
import { UI_TEXT } from "@/constants/messages";
import { siteFixture } from "@tests/support/fixtures/content";

const nav = vi.hoisted(() => ({ pathname: "/services/elderly-care" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

const site = siteFixture({
  navigation: [
    { label: { en: "About" }, href: "/about", visible: true },
    { label: { en: "Services" }, href: "/services", visible: true },
    { label: { en: "Brochure" }, href: "/brochure", visible: false },
  ],
});

describe("SiteHeader", () => {
  it("links the logo home and lists the pages, marking where the visitor is", () => {
    render(<SiteHeader site={site} />);
    expect(screen.getByRole("link", { name: UI_TEXT.siteName })).toHaveAttribute("href", "/");
    const main = screen.getByRole("navigation", { name: UI_TEXT.mainNavigation });
    expect(
      within(main)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["About", "Services"]);
    expect(within(main).getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
    expect(within(main).getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });

  it("offers the quote as its one main action, and is not pinned over the page (D107)", () => {
    render(<SiteHeader site={site} />);
    expect(screen.getAllByRole("link", { name: UI_TEXT.requestQuote })[0]).toHaveAttribute("href", "/request-a-quote");
    expect(screen.getByRole("banner").className).not.toMatch(/\b(sticky|fixed)\b/);
  });

  it("still stands, with the logo and the quote, before the site content is published", () => {
    render(<SiteHeader site={null} />);
    expect(screen.getByRole("link", { name: UI_TEXT.siteName })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /\+974/ })).not.toBeInTheDocument();
  });
});
