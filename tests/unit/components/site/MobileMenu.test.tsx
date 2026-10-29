import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { MobileMenu } from "@/components/site/MobileMenu";
import { UI_TEXT } from "@/constants/messages";
import { siteFixture } from "@tests/support/fixtures/content";

const nav = vi.hoisted(() => ({ pathname: "/careers" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const links = [
  { label: { en: "Services" }, href: "/services", visible: true },
  { label: { en: "Careers" }, href: "/careers", visible: true },
];

describe("MobileMenu", () => {
  it("opens over the whole screen, each page a row, the current one marked", async () => {
    render(<MobileMenu site={siteFixture()} links={links} />);
    const button = screen.getByRole("button", { name: UI_TEXT.menu });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("dialog", { name: UI_TEXT.menu });
    expect(within(menu).getByRole("link", { name: "Careers" })).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("link", { name: "Services" })).not.toHaveAttribute("aria-current");
    expect(within(menu).getByRole("link", { name: UI_TEXT.whatsapp }).getAttribute("href")).toMatch(
      /^https:\/\/wa\.me\//,
    );
    expect(within(menu).getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
  });

  it("closes from its button, after choosing a page, and after the quote", async () => {
    render(<MobileMenu site={siteFixture()} links={links} />);
    const button = screen.getByRole("button", { name: UI_TEXT.menu });

    await userEvent.click(button);
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(button);
    await userEvent.click(screen.getByRole("link", { name: "Services" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(button);
    await userEvent.click(screen.getByRole("link", { name: UI_TEXT.requestQuote }));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("offers the quote alone before the site content is published", async () => {
    render(<MobileMenu site={null} links={[]} />);
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.menu }));
    const menu = screen.getByRole("dialog");
    expect(within(menu).queryByRole("link", { name: UI_TEXT.whatsapp })).not.toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: UI_TEXT.requestQuote })).toBeInTheDocument();
  });
});
