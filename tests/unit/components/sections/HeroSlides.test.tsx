import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { HeroSlides } from "@/components/sections/HeroSlides";
import { UI_TEXT } from "@/constants/messages";

const slides = (count: number) =>
  render(
    <HeroSlides
      label="Highlights"
      photos={Array.from({ length: count }, (_, at) => (
        <span key={at}>{`Photo ${at + 1}`}</span>
      ))}
      texts={Array.from({ length: count }, (_, at) => (
        <p key={at}>{`Words ${at + 1}`}</p>
      ))}
      note={<p>The note</p>}
    />,
  );

/** One of a photo's animations ending, as each browser names the event. */
const ended = (element: Element, animationName: string) => {
  for (const type of ["animationend", "webkitAnimationEnd"]) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, "animationName", { value: animationName });
    fireEvent(element, event);
  }
};

const current = (selector: string) => document.querySelector(`${selector}[data-current]`)?.textContent;

describe("HeroSlides (D128)", () => {
  it("is a named carousel showing the first slide, its photo and the note, the count beside the controls", () => {
    slides(3);
    expect(screen.getByRole("region", { name: "Highlights" })).toHaveAttribute("aria-roledescription", "carousel");
    expect(current(".slide-text")).toBe("Words 1");
    expect(current(".slide-photo")).toBe("Photo 1");
    expect(screen.getByText("The note")).toBeInTheDocument();
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: UI_TEXT.slideOf(1, 3) })).toHaveAttribute("aria-current", "true");
  });

  it("moves on and back by its arrows, round the ends, keeping the slide it replaced under the new one", async () => {
    const user = userEvent.setup();
    slides(3);
    await user.click(screen.getByRole("button", { name: UI_TEXT.nextSlide }));
    expect(current(".slide-text")).toBe("Words 2");
    expect(document.querySelector(".slide-photo[data-was]")?.textContent).toBe("Photo 1");
    expect(screen.getByRole("region", { name: "Highlights" })).toHaveAttribute("data-moved");
    await user.click(screen.getByRole("button", { name: UI_TEXT.previousSlide }));
    await user.click(screen.getByRole("button", { name: UI_TEXT.previousSlide }));
    expect(current(".slide-text")).toBe("Words 3");
    await user.click(screen.getByRole("button", { name: UI_TEXT.slideOf(2, 3) }));
    expect(screen.getByText("02 / 03")).toBeInTheDocument();
  });

  it("moves on when the current photo's drift ends, as its bar fills, and only then, the bars before it full", () => {
    slides(2);
    const [first, second] = document.querySelectorAll(".slide-photo");
    ended(second, "drift");
    expect(current(".slide-text")).toBe("Words 1");
    // A moved photo's wipe ends long before its drift.
    ended(first, "wipe");
    expect(current(".slide-text")).toBe("Words 1");
    ended(first, "drift");
    expect(current(".slide-text")).toBe("Words 2");
    expect(document.querySelector(".slide-bar[data-done]")).toHaveAttribute("aria-label", UI_TEXT.slideOf(1, 2));
  });

  it("pauses and plays by its button, telling a screen reader the slide only while paused", async () => {
    const user = userEvent.setup();
    slides(2);
    const live = document.querySelector("[aria-live]");
    expect(live).toHaveAttribute("aria-live", "off");
    await user.click(screen.getByRole("button", { name: UI_TEXT.pauseSlides }));
    expect(screen.getByRole("region", { name: "Highlights" })).toHaveAttribute("data-paused");
    expect(live).toHaveAttribute("aria-live", "polite");
    await user.click(screen.getByRole("button", { name: UI_TEXT.playSlides }));
    expect(screen.getByRole("region", { name: "Highlights" })).not.toHaveAttribute("data-paused");
  });

  it("has no controls with one slide", () => {
    slides(1);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
