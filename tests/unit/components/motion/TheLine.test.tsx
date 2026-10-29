import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TheLine } from "@/components/motion/TheLine";
import { UI_TEXT } from "@/constants/messages";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine, mockObservers } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

const STATIONS = [
  { id: "home-nursing-care", label: "Home nursing care" },
  { id: "elderly-care", label: "Elderly care" },
  { id: "palliative-care", label: "Palliative care" },
];

/** The sections, at the given tops on a page 3000 px tall seen through an 800 px window. */
function page(tops: number[]) {
  document.body.innerHTML = "";
  STATIONS.forEach(({ id }, index) => {
    const section = document.createElement("section");
    section.id = id;
    section.getBoundingClientRect = () => ({ top: tops[index] }) as DOMRect;
    document.body.append(section);
  });
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3000 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
}

let observers: ReturnType<typeof mockObservers>;
beforeEach(() => {
  observers = mockObservers();
  motion.engine = null;
});
afterEach(() => vi.unstubAllGlobals());

describe("TheLine", () => {
  it("is a list of links to the page's sections, the first one current", () => {
    page([0, 1000, 2600]);
    render(<TheLine stations={STATIONS} tone="deep" />);
    const nav = screen.getByRole("navigation", { name: UI_TEXT.onThisPage });
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#home-nursing-care",
      "#elderly-care",
      "#palliative-care",
    ]);
    expect(nav).toContainElement(links[0]);
    expect(screen.getByRole("link", { name: "Home nursing care" })).toHaveAttribute("aria-current", "location");
  });

  it("places each station where its section arrives, measured again as the page changes size", () => {
    page([0, 1000, 2600]);
    render(<TheLine stations={STATIONS} tone="sky" />);
    // (1000 - 0.45 * 800) / (3000 - 800) = 640 / 2200
    expect(screen.getByRole("link", { name: "Elderly care" }).style.top).toBe(`${(640 / 2200) * 100}%`);
    expect(screen.getByRole("link", { name: "Home nursing care" }).style.top).toBe("0%");
    expect(screen.getByRole("link", { name: "Palliative care" }).style.top).toBe("100%");

    document.getElementById("elderly-care")!.getBoundingClientRect = () => ({ top: 1360 }) as DOMRect;
    act(() => observers.resizes[0].callback());
    expect(screen.getByRole("link", { name: "Elderly care" }).style.top).toBe(`${(1000 / 2200) * 100}%`);
  });

  it("marks the section crossing the arrival line as where the visitor is, and the ones before as passed", () => {
    page([0, 1000, 2600]);
    render(<TheLine stations={STATIONS} tone="leaf" />);
    const [observer] = observers.intersections;
    expect(observer.options?.rootMargin).toBe("-45% 0px -55% 0px");
    expect(observer.observed.map((element) => element.id)).toEqual(STATIONS.map((station) => station.id));

    act(() =>
      observer.callback(
        [
          { isIntersecting: false, target: document.getElementById("home-nursing-care")! },
          { isIntersecting: true, target: document.getElementById("palliative-care")! },
        ] as unknown as IntersectionObserverEntry[],
        observer as unknown as IntersectionObserver,
      ),
    );
    expect(screen.getByRole("link", { name: "Palliative care" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Palliative care" })).toHaveClass("bg-leaf");
    expect(screen.getByRole("link", { name: "Elderly care" })).toHaveClass("border-leaf");
    expect(screen.getByRole("link", { name: "Home nursing care" })).not.toHaveAttribute("aria-current");
  });

  it("makes the last station current once the page is read to its end, and hands back as it scrolls up", () => {
    page([0, 1000, 2600]);
    const { unmount } = render(<TheLine stations={STATIONS} tone="deep" />);
    const [arrival, end] = observers.intersections;
    const sentinel = end.observed[0];
    expect(sentinel.parentElement).toBe(document.body);
    expect(sentinel).toHaveAttribute("aria-hidden", "true");

    act(() =>
      end.callback(
        [{ isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        end as unknown as IntersectionObserver,
      ),
    );
    expect(screen.getByRole("link", { name: "Palliative care" })).toHaveAttribute("aria-current", "location");

    act(() =>
      end.callback(
        [{ isIntersecting: false }] as unknown as IntersectionObserverEntry[],
        end as unknown as IntersectionObserver,
      ),
    );
    expect(screen.getByRole("link", { name: "Home nursing care" })).toHaveAttribute("aria-current", "location");
    expect(arrival.disconnect).not.toHaveBeenCalled();

    unmount();
    expect(end.disconnect).toHaveBeenCalled();
    expect(sentinel.isConnected).toBe(false);
  });

  it("names the current station on a phone, out of the screen reader's way", () => {
    page([0, 1000, 2600]);
    const { container } = render(<TheLine stations={STATIONS} tone="deep" />);
    const bar = container.querySelector('[aria-hidden="true"].fixed')!;
    expect(bar).toHaveTextContent(`${UI_TEXT.youAreHere}Home nursing care`);
  });

  it("is drawn in full with no marker until motion loads, then draws with the scroll as the marker travels", () => {
    page([0, 1000, 2600]);
    const { container, rerender, unmount } = render(<TheLine stations={STATIONS} tone="deep" />);
    expect(container.querySelector("[data-line-marker]")).toHaveClass("hidden");

    const fake = fakeEngine();
    motion.engine = fake.engine;
    rerender(<TheLine stations={STATIONS} tone="deep" />);
    const scroll = { start: 0, end: "max", scrub: MOTION.scrub, invalidateOnRefresh: true };
    expect(fake.gsap.fromTo).toHaveBeenCalledWith(
      container.querySelector("[data-line-fill]"),
      { scaleY: 0 },
      { scaleY: 1, ease: "none", scrollTrigger: scroll },
    );
    expect(fake.gsap.fromTo).toHaveBeenCalledWith(
      container.querySelector("[data-line-progress]"),
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: scroll },
    );
    const [, , travel] = fake.gsap.fromTo.mock.calls.find(
      ([target]) => target === container.querySelector("[data-line-marker]"),
    )!;
    expect((travel as { y: () => number }).y()).toBe(0);
    expect(container.querySelector("[data-line-marker]")).not.toHaveClass("hidden");

    unmount();
    expect((travel as { y: () => number }).y()).toBe(0);
    expect(fake.revert).toHaveBeenCalled();
    expect(observers.intersections[0].disconnect).toHaveBeenCalled();
    expect(observers.resizes[0].disconnect).toHaveBeenCalled();
  });

  it("copes with a section missing from the page, and a page too short to scroll", () => {
    document.body.innerHTML = "";
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 600 });
    render(<TheLine stations={[]} tone="deep" />);
    const end = observers.intersections[1];
    act(() =>
      end.callback(
        [{ isIntersecting: true }] as unknown as IntersectionObserverEntry[],
        end as unknown as IntersectionObserver,
      ),
    );
    expect(screen.queryAllByRole("link")).toEqual([]);

    render(<TheLine stations={STATIONS} tone="deep" />);
    expect(screen.getByRole("link", { name: "Elderly care" }).style.top).toBe("0%");
  });
});
