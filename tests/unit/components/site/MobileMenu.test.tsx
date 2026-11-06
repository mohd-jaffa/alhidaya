import { act, createEvent, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileMenu } from "@/components/site/MobileMenu";
import { UI_TEXT } from "@/constants/messages";
import { REDUCED_MOTION_QUERY } from "@/lib/motion/preferences";
import { siteFixture } from "@tests/support/fixtures/content";
import { mockMedia } from "@tests/support/motion";

let media: ReturnType<typeof mockMedia>;
beforeEach(() => {
  media = mockMedia({});
});

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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const links = [
  { label: { en: "Services" }, href: "/services", visible: true },
  { label: { en: "Careers" }, href: "/careers", visible: true },
];

describe("MobileMenu", () => {
  it("opens over the whole screen in deep blue, each page a row, the current one marked (D167)", async () => {
    render(<MobileMenu site={siteFixture()} links={links} />);
    const button = screen.getByRole("button", { name: UI_TEXT.menu });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("dialog", { name: UI_TEXT.menu });
    expect(menu).toHaveClass("menu-sheet", "bg-deep");
    expect(within(menu).getByRole("link", { name: "Careers" })).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("link", { name: "Services" })).not.toHaveAttribute("aria-current");
    expect(within(menu).getByRole("link", { name: "Careers" })).toHaveClass("font-semibold");
    expect(within(menu).getByRole("link", { name: "Services" })).toHaveClass("font-medium", "border-b");
    expect(within(menu).getByRole("link", { name: "Careers" })).not.toHaveClass("border-b");
  });

  it("offers WhatsApp and a call as two tiles with the number, and nothing else to read out (D167)", async () => {
    render(<MobileMenu site={siteFixture()} links={links} />);
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.menu }));
    const menu = screen.getByRole("dialog", { name: UI_TEXT.menu });
    const whatsapp = within(menu).getByRole("link", { name: new RegExp(`^${UI_TEXT.whatsappUs}`) });
    expect(whatsapp.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/97431306555/);
    expect(whatsapp).toHaveClass("bg-leaf");
    expect(whatsapp.querySelector("use")).toBeInTheDocument();
    const call = within(menu).getByRole("link", { name: new RegExp(`^${UI_TEXT.callUs}`) });
    expect(call).toHaveAttribute("href", "tel:+97431306555");
    expect(call).toHaveClass("bg-card");
    // The email and the hours stay out of the menu.
    expect(within(menu).queryByRole("link", { name: /@/ })).not.toBeInTheDocument();
    expect(menu).not.toHaveTextContent("24/7");
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

  it("closes cleanly if its leaving animation is cancelled and removes its listener on unmount", () => {
    const { unmount } = render(<MobileMenu site={siteFixture()} links={links} />);
    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.menu }));
    const menu = screen.getByRole("dialog");
    const cancel = (target: Element, animationName = "menu-out") => {
      const event = new Event("animationcancel", { bubbles: true });
      Object.defineProperty(event, "animationName", { value: animationName });
      fireEvent(target, event);
    };
    cancel(menu);
    expect(menu).toHaveAttribute("open");
    vi.mocked(window.matchMedia).mock.results[0].value.matches = true;
    act(() => media.set(REDUCED_MOTION_QUERY, true));
    expect(menu).toHaveAttribute("open");
    vi.mocked(window.matchMedia).mock.results[0].value.matches = false;
    act(() => media.set(REDUCED_MOTION_QUERY, false));
    const style = window.getComputedStyle(menu);
    vi.spyOn(window, "getComputedStyle").mockReturnValue(
      new Proxy(style, {
        get: (target, key) => {
          if (key === "animationName") return "menu-out";
          const value = Reflect.get(target, key);
          return typeof value === "function" ? value.bind(target) : value;
        },
      }),
    );
    fireEvent.click(within(menu).getByRole("button", { name: UI_TEXT.close }));
    expect(menu).toHaveAttribute("data-closing");
    cancel(within(menu).getByRole("button", { name: UI_TEXT.close }));
    cancel(menu, "menu-in");
    expect(menu).toHaveAttribute("open");
    cancel(menu);
    expect(menu).not.toHaveAttribute("open");
    expect(menu).not.toHaveAttribute("data-closing");
    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.menu }));
    fireEvent.click(within(menu).getByRole("button", { name: UI_TEXT.close }));
    // Preference changes can happen before the leaving animation's first frame,
    // when no animationcancel event exists yet.
    vi.mocked(window.matchMedia).mock.results[0].value.matches = true;
    act(() => media.set(REDUCED_MOTION_QUERY, true));
    expect(menu).not.toHaveAttribute("open");
    const remove = vi.spyOn(menu, "removeEventListener");
    unmount();
    expect(remove).toHaveBeenCalledWith("animationcancel", expect.any(Function));
    expect(media.listening(REDUCED_MOTION_QUERY)).toBe(0);
  });

  it("lifts its sheet away before it closes, from its button, a page and Escape, and waits for that to end (D167)", async () => {
    render(<MobileMenu site={siteFixture()} links={links} />);
    const button = screen.getByRole("button", { name: UI_TEXT.menu });
    const real = window.getComputedStyle;
    // The sheet reports its leaving animation; everything else is read as it is.
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
      const style = real(element, pseudo);
      if (!element.classList.contains("menu-sheet")) return style;
      return new Proxy(style, {
        get: (target, key) => {
          if (key === "animationName") return "menu-out";
          const value = Reflect.get(target, key);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    });
    const sheetEnds = (name: string, target: Element) => {
      for (const type of ["animationend", "webkitAnimationEnd"]) {
        const event = new Event(type, { bubbles: true });
        Object.defineProperty(event, "animationName", { value: name });
        fireEvent(target, event);
      }
    };

    await userEvent.click(button);
    const menu = screen.getByRole("dialog", { name: UI_TEXT.menu });
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.close }));
    // The sheet is on its way out, still open.
    expect(menu).toHaveAttribute("data-closing");
    expect(menu).toHaveAttribute("open");
    // A row's own fade ending, or another animation of the sheet, does not close it.
    sheetEnds("menu-fade", within(menu).getByRole("link", { name: "Services" }));
    sheetEnds("menu-in", menu);
    expect(menu).toHaveAttribute("open");
    // Asking again while it leaves changes nothing.
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.close }));
    sheetEnds("menu-out", menu);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menu).not.toHaveAttribute("data-closing");
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Escape takes the same way out instead of closing at once.
    await userEvent.click(button);
    const escape = createEvent.keyDown(menu, { key: "Escape" });
    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(menu, cancel);
    fireEvent(menu, escape);
    expect(cancel.defaultPrevented).toBe(true);
    expect(menu).toHaveAttribute("data-closing");
    sheetEnds("menu-out", menu);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // And so does choosing a page.
    await userEvent.click(button);
    await userEvent.click(screen.getByRole("link", { name: "Services" }));
    expect(menu).toHaveAttribute("data-closing");
    sheetEnds("menu-out", menu);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes at once when nothing animates, as with reduced motion", async () => {
    render(<MobileMenu site={siteFixture()} links={links} />);
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.menu }));
    const menu = screen.getByRole("dialog", { name: UI_TEXT.menu });
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ animationName: "none" } as CSSStyleDeclaration);
    fireEvent(menu, new Event("cancel", { cancelable: true }));
    expect(menu).not.toHaveAttribute("open");
    expect(menu).not.toHaveAttribute("data-closing");
  });

  it("offers the quote alone before the site content is published", async () => {
    render(<MobileMenu site={null} links={[]} />);
    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.menu }));
    const menu = screen.getByRole("dialog");
    expect(within(menu).queryByRole("link", { name: UI_TEXT.whatsapp })).not.toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: UI_TEXT.requestQuote })).toHaveClass("bg-card", "text-deep");
  });
});
