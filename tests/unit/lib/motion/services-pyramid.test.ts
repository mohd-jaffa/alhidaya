import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mountServicesPyramid } from "@/lib/motion/services-pyramid";
import { REDUCED_MOTION_QUERY } from "@/lib/motion/preferences";
import { mockMedia, mockObservers } from "@tests/support/motion";

let stop: (() => void) | undefined;
let media: ReturnType<typeof mockMedia>;
let observers: ReturnType<typeof mockObservers>;
function setup(count = 8, width = 1000) {
  const root = document.createElement("div");
  root.style.setProperty("--duration-slide", "6s");
  root.innerHTML = '<button data-step="-1">Previous</button><button data-step="1">Next</button><ul></ul>';
  const list = root.querySelector("ul")!;
  for (let i = 0; i < count; i++) {
    const card = document.createElement("li");
    card.innerHTML = `<a href="/services/${i}">Service ${i}</a>`;
    Object.defineProperty(card, "offsetWidth", { value: 300 });
    Object.defineProperty(card, "offsetLeft", {
      get: () => (root.style.direction === "rtl" ? list.clientWidth - 300 - i * 320 : i * 320),
    });
    list.append(card);
  }
  Object.defineProperty(list, "clientWidth", { configurable: true, value: width });
  document.body.append(root);
  stop = mountServicesPyramid(root);
  const visible = (shown: boolean) =>
    observers.intersections[0].callback(
      [{ isIntersecting: shown }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
  const current = () => list.querySelector<HTMLElement>('[data-current="true"]')!;
  return { root, list, visible, current };
}
beforeEach(() => {
  vi.useFakeTimers();
  media = mockMedia({});
  observers = mockObservers();
});
afterEach(() => {
  stop?.();
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Home services pyramid (D185)", () => {
  it("centres the third published card, keeping rear cards smaller and softening only their photographs", () => {
    const { root, list, current } = setup();
    expect(root.dataset.pyramid).toBe("true");
    expect(current()).toHaveTextContent("Service 2");
    expect(current().style.transform).toContain("scale(1)");
    const rear = list.children[1] as HTMLElement;
    expect(rear.style.transform).toContain("scale(0.88)");
    expect(rear.style.getPropertyValue("--pyramid-photo-opacity")).toBe("0.72");
    expect(current().style.transform).toBe("translateX(-290px) scale(1)");
    expect(rear.style.transform).toBe("translateX(-110px) scale(0.88)");
    expect(list.children[0]).toHaveAttribute("aria-hidden", "true");
    expect(list.children[5]).toHaveAttribute("aria-hidden", "true");
    expect((list.children[5] as HTMLElement).inert).toBe(true);
  });
  it("uses the independent six-second duration only in view; clicking and swiping never leave playback stuck", () => {
    const { root, current, visible } = setup();
    vi.advanceTimersByTime(12000);
    expect(current()).toHaveTextContent("Service 2");
    visible(true);
    vi.advanceTimersByTime(5999);
    expect(current()).toHaveTextContent("Service 2");
    vi.advanceTimersByTime(1);
    expect(current()).toHaveTextContent("Service 3");
    fireEvent.click(root.querySelector('[data-step="-1"]')!);
    expect(current()).toHaveTextContent("Service 2");
    fireEvent.click(root.querySelector('[data-step="1"]')!);
    const pointer = (type: string, x: number) =>
      fireEvent(root, Object.assign(new Event(type, { bubbles: true }), { clientX: x }));
    pointer("pointerdown", 200);
    pointer("pointerup", 100);
    expect(current()).toHaveTextContent("Service 4");
    pointer("pointerdown", 100);
    pointer("pointerup", 200);
    expect(current()).toHaveTextContent("Service 3");
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    root.dispatchEvent(clickEvent);
    expect(clickEvent.defaultPrevented).toBe(true);
    pointer("pointerdown", 200);
    pointer("pointerup", 100);
    // A fresh tap after a swipe must still open its link, even if the swipe generated no click.
    pointer("pointerdown", 100);
    pointer("pointerup", 100);
    const freshTap = new MouseEvent("click", { bubbles: true, cancelable: true });
    root.dispatchEvent(freshTap);
    expect(freshTap.defaultPrevented).toBe(false);

    pointer("pointerdown", 100);
    pointer("pointercancel", 100);
    pointer("pointerup", 110);
    pointer("pointerup", 200);
    vi.advanceTimersByTime(6000);
    expect(current()).toHaveTextContent("Service 5");
    visible(false);
    vi.advanceTimersByTime(12000);
    expect(current()).toHaveTextContent("Service 5");
  });
  it("pauses while the tab is hidden and whenever reduced motion is requested", () => {
    const { current, visible } = setup();
    visible(true);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    fireEvent(document, new Event("visibilitychange"));
    vi.advanceTimersByTime(6000);
    expect(current()).toHaveTextContent("Service 2");
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    fireEvent(document, new Event("visibilitychange"));
    vi.mocked(window.matchMedia).mock.results[0].value.matches = true;
    media.set(REDUCED_MOTION_QUERY, true);
    vi.advanceTimersByTime(6000);
    expect(current()).toHaveTextContent("Service 2");
    vi.mocked(window.matchMedia).mock.results[0].value.matches = false;
    media.set(REDUCED_MOTION_QUERY, false);
    vi.advanceTimersByTime(6000);
    expect(current()).toHaveTextContent("Service 3");
  });
  it("brings a focused rear link forward and stops during deliberate keyboard focus", () => {
    const { root, list, current, visible } = setup();
    visible(true);
    fireEvent.keyDown(document, { key: "Tab" });
    list.children[1].querySelector("a")!.focus();
    expect(current()).toHaveTextContent("Service 1");
    vi.advanceTimersByTime(12000);
    expect(current()).toHaveTextContent("Service 1");
    root.querySelector("button")!.focus();
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent(root, Object.assign(new Event("pointerdown"), { clientX: 0 }));
    vi.advanceTimersByTime(6000);
    expect(current()).toHaveTextContent("Service 2");
  });
  it("retains three stepped cards on phone resize and mirrors positions and swipes in RTL", () => {
    const { root, list, current } = setup();
    Object.defineProperty(list, "clientWidth", { configurable: true, value: 390 });
    root.style.direction = "rtl";
    observers.resizes[0].callback();
    expect(list.querySelectorAll('[aria-hidden="false"]')).toHaveLength(3);
    expect(list.children[0]).toHaveAttribute("aria-hidden", "true");
    expect((list.children[0] as HTMLElement).inert).toBe(true);
    expect((list.children[0] as HTMLElement).style.transform).toContain("scale(0.88)");
    expect((list.children[1] as HTMLElement).style.transform).toContain("translateX(329.6px)");
    expect((list.children[3] as HTMLElement).style.transform).toBe("translateX(860.4px) scale(0.88)");
    Object.defineProperty(list, "clientWidth", { configurable: true, value: 1000 });
    observers.resizes[0].callback();
    expect((list.children[1] as HTMLElement).style.transform).toContain("translateX(110px)");
    fireEvent(root, Object.assign(new Event("pointerdown"), { clientX: 200 }));
    fireEvent(root, Object.assign(new Event("pointerup"), { clientX: 100 }));
    expect(current()).toHaveTextContent("Service 1");
  });
  it.each([0, 1, 2])("handles %i services without an automatic clock for fewer than two", (count) => {
    const { root, visible } = setup(count);
    visible(true);
    if (count < 2) expect(vi.getTimerCount()).toBe(0);
    else {
      fireEvent.click(root.querySelector('[data-step="-1"]')!);
      expect(root.querySelector('[data-current="true"]')).toHaveTextContent("Service 1");
    }
  });
  it("keeps one pointer, ignores vertical/right-button gestures and recovers from interrupted gestures", () => {
    const { root, current } = setup();
    const pointer = (type: string, x: number, y = 0, id = 1, extra = {}, target: Element | Window | Document = root) =>
      fireEvent(
        target,
        Object.assign(new Event(type, { bubbles: true }), { clientX: x, clientY: y, pointerId: id, ...extra }),
      );
    pointer("pointerdown", 200);
    pointer("pointerdown", 400, 0, 2, { isPrimary: false });
    pointer("pointerup", 100, 0, 2);
    expect(current()).toHaveTextContent("Service 2");
    pointer("pointerup", 100);
    expect(current()).toHaveTextContent("Service 3");
    pointer("pointerdown", 200, 0, 1, { button: 2 });
    pointer("pointerup", 100);
    expect(current()).toHaveTextContent("Service 3");
    pointer("pointerdown", 200, 0, 2, { isPrimary: false });
    pointer("pointerup", 100, 0, 2);
    expect(current()).toHaveTextContent("Service 3");
    pointer("pointerdown", 200);
    pointer("pointerup", 150, 200);
    expect(current()).toHaveTextContent("Service 3");
    for (const interruption of ["pointercancel", "lostpointercapture", "blur", "visibilitychange"]) {
      pointer("pointerdown", 200);
      const target = interruption === "blur" ? window : interruption === "visibilitychange" ? document : root;
      if (interruption === "visibilitychange")
        Object.defineProperty(document, "hidden", { configurable: true, value: true });
      fireEvent(target, new Event(interruption));
      pointer("pointerup", 100);
      expect(current()).toHaveTextContent("Service 3");
    }
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    pointer("pointerdown", 200);
    pointer("pointerup", 100, 0, 1, {}, window);
    expect(current()).toHaveTextContent("Service 4");
    pointer("pointerdown", 200);
    pointer("pointerup", 100);
    expect(current()).toHaveTextContent("Service 5");
  });

  it("disconnects observers, timers, media and interaction listeners on navigation", () => {
    const { root, current, visible } = setup();
    visible(true);
    stop!();
    stop = undefined;
    expect(observers.intersections[0].disconnect).toHaveBeenCalled();
    expect(observers.resizes[0].disconnect).toHaveBeenCalled();
    expect(media.listening(REDUCED_MOTION_QUERY)).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(root.querySelector('[data-step="1"]')!);
    expect(current()).toHaveTextContent("Service 2");
  });
});
