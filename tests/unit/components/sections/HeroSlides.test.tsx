import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeroSlides } from "@/components/sections/HeroSlides";
import { UI_TEXT } from "@/constants/messages";
import { mockObservers } from "@tests/support/motion";

afterEach(() => vi.unstubAllGlobals());

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
const currentImage = () => document.querySelector(".slide-photo[data-current] .slide-image")!;

describe("HeroSlides (D128, D136)", () => {
  it("pauses its existing CSS clock offscreen, resumes in view and releases observation", () => {
    const { intersections } = mockObservers();
    const { unmount } = slides(3);
    const hero = screen.getByRole("region", { name: "Highlights" });
    const observer = intersections[0];
    expect(observer.observed).toEqual([hero]);
    act(() =>
      observer.callback([{ isIntersecting: false }] as IntersectionObserverEntry[], {} as IntersectionObserver),
    );
    expect(hero).toHaveAttribute("data-offscreen");
    act(() => observer.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(hero).not.toHaveAttribute("data-offscreen");
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });
  it("opens on the first photo and words, with chevrons around decorative progress and no count", () => {
    slides(3);
    const hero = screen.getByRole("region", { name: "Highlights" });
    expect(hero).toHaveAttribute("aria-roledescription", "carousel");
    expect(hero).toHaveAttribute("aria-description", UI_TEXT.slidesAutoplayHelp);
    expect(hero).toHaveAttribute("tabindex", "0");
    expect(current(".slide-text")).toBe("Words 1");
    expect(current(".slide-photo")).toBe("Photo 1");
    expect(screen.getByText("The note")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: UI_TEXT.previousSlide })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: UI_TEXT.nextSlide })).toBeInTheDocument();
    expect(screen.queryByText(/01.*03/)).not.toBeInTheDocument();
    expect(document.querySelectorAll(".slide-bar")).toHaveLength(3);
    expect(document.querySelector(".slide-progress")).not.toHaveAttribute("aria-hidden");
    expect(document.querySelector(".slide-bar")!.parentElement).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector("[aria-live]")).toHaveAttribute("aria-live", "off");
  });

  it("advances only when the current photo's drift finishes, filling its progress bar", () => {
    slides(3);
    const first = currentImage();
    ended(document.querySelectorAll(".slide-image")[1], "drift");
    ended(first, "wipe");
    ended(first.firstElementChild!, "drift");
    expect(current(".slide-text")).toBe("Words 1");
    ended(first, "drift");
    expect(current(".slide-text")).toBe("Words 2");
    expect(document.querySelector(".slide-photo[data-was] .slide-image")).toBe(first);
    expect(document.querySelector(".slide-photo[data-was]")).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector(".slide-photo[data-current]")).toHaveAttribute("aria-hidden", "false");
    expect(document.querySelectorAll(".slide-bar[data-done]")).toHaveLength(1);
    expect(screen.getByRole("region", { name: "Highlights" })).toHaveAttribute("data-moved");
  });

  it("manually wraps backwards and forwards with a fresh clock, then ignores an outgoing end event", () => {
    slides(3);
    const first = currentImage();
    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.previousSlide }));
    expect(current(".slide-text")).toBe("Words 3");
    ended(first, "drift");
    expect(current(".slide-text")).toBe("Words 3");
    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.nextSlide }));
    expect(current(".slide-text")).toBe("Words 1");
    expect(currentImage()).not.toBe(first);
    expect(document.querySelectorAll(".slide-bar[data-done]")).toHaveLength(0);
    ended(currentImage(), "drift");
    expect(current(".slide-text")).toBe("Words 2");
  });

  it("wraps to a fresh first photo after the last slide, with its progress reset", () => {
    slides(2);
    const first = currentImage();
    ended(first, "drift");
    ended(currentImage(), "drift");
    expect(current(".slide-text")).toBe("Words 1");
    expect(currentImage()).not.toBe(first);
    expect(document.querySelectorAll(".slide-bar[data-done]")).toHaveLength(0);
  });

  it("keeps a single slide still, with no progress or extra keyboard stop", () => {
    slides(1);
    ended(currentImage(), "drift");
    expect(current(".slide-text")).toBe("Words 1");
    expect(document.querySelector(".slide-progress")).toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const hero = screen.getByRole("region", { name: "Highlights" });
    expect(hero).not.toHaveAttribute("tabindex");
    expect(hero).not.toHaveAttribute("aria-description");
    expect(hero).not.toHaveAttribute("data-moved");
  });
});
