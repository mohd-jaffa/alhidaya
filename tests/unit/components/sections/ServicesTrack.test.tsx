import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServicesTrack } from "@/components/sections/ServicesTrack";
import { UI_TEXT } from "@/constants/messages";
import { mockMedia } from "@tests/support/motion";

const track = () => {
  render(
    <ServicesTrack
      opening={<h2>What we do</h2>}
      cards={["Home nursing care", "Elderly care", "Child care"].map((name) => (
        <li key={name}>{name}</li>
      ))}
    />,
  );
  return screen.getByRole("list");
};

/** The row's scroll, as a browser would report it: how far along, how wide in all, how wide on screen. */
function place(list: HTMLElement, scrollLeft: number, scrollWidth = 900, clientWidth = 300) {
  Object.defineProperties(list, {
    scrollLeft: { configurable: true, value: scrollLeft },
    scrollWidth: { configurable: true, value: scrollWidth },
    clientWidth: { configurable: true, value: clientWidth },
  });
  fireEvent.scroll(list);
}

const still = (reduce: boolean) => mockMedia({ "(prefers-reduced-motion: reduce)": reduce });

afterEach(() => vi.restoreAllMocks());

describe("ServicesTrack (D131)", () => {
  it("shows the opening and the cards, the earlier arrow resting at the start", () => {
    track();
    expect(screen.getByRole("heading", { name: "What we do" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("button", { name: UI_TEXT.previousServices })).toBeDisabled();
  });

  it("moves the row by about a card each way, smoothly unless motion is reduced", async () => {
    const user = userEvent.setup();
    const list = track();
    const scrollBy = vi.fn();
    list.scrollBy = scrollBy;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 280 } as DOMRect);
    place(list, 0);
    still(false);
    await user.click(screen.getByRole("button", { name: UI_TEXT.nextServices }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 300, behavior: "smooth" });
    place(list, 300);
    still(true);
    await user.click(screen.getByRole("button", { name: UI_TEXT.previousServices }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -300, behavior: "auto" });
  });

  it("rests the later arrow at the row's end, a right-to-left row measured the same way", () => {
    const list = track();
    place(list, -600);
    expect(screen.getByRole("button", { name: UI_TEXT.nextServices })).toBeDisabled();
    expect(screen.getByRole("button", { name: UI_TEXT.previousServices })).toBeEnabled();
    fireEvent(window, new Event("resize"));
    expect(screen.getByRole("button", { name: UI_TEXT.nextServices })).toBeDisabled();
  });

  it("moves a right-to-left row the other way, and by the row's width with no card in it", async () => {
    const user = userEvent.setup();
    render(<ServicesTrack opening={<h2>What we do</h2>} cards={[]} />);
    const list = screen.getByRole("list");
    const scrollBy = vi.fn();
    list.scrollBy = scrollBy;
    list.style.direction = "rtl";
    Object.defineProperty(list, "clientWidth", { configurable: true, value: 500 });
    still(false);
    place(list, 0, 2000, 500);
    await user.click(screen.getByRole("button", { name: UI_TEXT.nextServices }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -520, behavior: "smooth" });
  });
});
