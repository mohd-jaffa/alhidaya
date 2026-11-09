import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GoogleMap } from "@/components/ui/google-map";
import { UI_TEXT } from "@/constants/messages";
import { MAP_SCROLL_IDLE_MS } from "@/constants/limits";
import { mockObservers } from "@tests/support/motion";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("GoogleMap", () => {
  it("defers the frame until scrolling settles while it is visible", () => {
    vi.useFakeTimers();
    const { intersections } = mockObservers();
    render(<GoogleMap query="Doha" pin={null} />);
    const frame = screen.getByTitle(UI_TEXT.satelliteMap);
    const observer = intersections[0];
    const enter = (visible: boolean) =>
      observer.callback([{ isIntersecting: visible }] as IntersectionObserverEntry[], {} as IntersectionObserver);
    expect(frame).not.toHaveAttribute("src");
    act(() => {
      enter(false);
      vi.advanceTimersByTime(MAP_SCROLL_IDLE_MS);
    });
    expect(frame).not.toHaveAttribute("src");
    act(() => {
      enter(true);
      vi.advanceTimersByTime(MAP_SCROLL_IDLE_MS - 1);
    });
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(MAP_SCROLL_IDLE_MS - 1));
    expect(frame).not.toHaveAttribute("src");
    act(() => vi.advanceTimersByTime(1));
    expect(frame.getAttribute("src")).toBe(frame.getAttribute("data-src"));
    expect(observer.disconnect).toHaveBeenCalled();
    act(() => {
      enter(true);
      vi.runAllTimers();
    });
    expect(vi.getTimerCount()).toBe(0);
  });
  it("cancels an unviewed map and pending work when leaving or unmounting", () => {
    vi.useFakeTimers();
    const { intersections } = mockObservers();
    const { unmount } = render(<GoogleMap query="Doha" pin={null} />);
    const frame = screen.getByTitle(UI_TEXT.satelliteMap);
    const observer = intersections[0];
    act(() => {
      observer.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver);
      observer.callback([{ isIntersecting: false }] as IntersectionObserverEntry[], {} as IntersectionObserver);
      vi.runAllTimers();
    });
    expect(frame).not.toHaveAttribute("src");
    act(() => observer.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
    unmount();
    act(() => vi.runAllTimers());
    expect(frame).not.toHaveAttribute("src");
    expect(observer.disconnect).toHaveBeenCalled();
  });
  it("loads immediately for keyboard focus without leaving a duplicate timer", () => {
    vi.useFakeTimers();
    const { intersections } = mockObservers();
    render(<GoogleMap query="Doha" pin={null} />);
    const frame = screen.getByTitle(UI_TEXT.satelliteMap);
    act(() =>
      intersections[0].callback([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver),
    );
    fireEvent.focus(frame);
    expect(frame.getAttribute("src")).toBe(frame.getAttribute("data-src"));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("provides an accessible lazy satellite frame with stable geometry and the approved shadow", () => {
    render(<GoogleMap query="Al Hidaya, Doha" pin={null} />);
    const frame = screen.getByTitle(UI_TEXT.satelliteMap);
    expect(frame).toHaveAttribute("loading", "lazy");
    expect(frame).toHaveAttribute("width", "600");
    expect(frame).toHaveAttribute("height", "400");
    expect(frame).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(frame).toHaveAttribute("allowfullscreen");
    expect(frame.parentElement).toHaveClass("min-h-map-min", "rounded-card", "shadow-map");
  });
});
