import { afterEach, describe, expect, it, vi } from "vitest";

import { mountTypewriters } from "@/lib/motion/typewriter";
import { MOTION } from "@/lib/motion/tokens";
import { mockObservers } from "@tests/support/motion";

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (Element.prototype as { animate?: unknown }).animate;
});

describe("mountTypewriters", () => {
  it("needs no loop or observer on a page without a typewriter", () => {
    const { intersections } = mockObservers();
    const stop = mountTypewriters();
    expect(intersections).toHaveLength(0);
    stop();
  });
  it("types and holds reserved letters, pauses offscreen/hidden and cancels on navigation or reduced motion", () => {
    const { intersections } = mockObservers();
    const handles: {
      play: ReturnType<typeof vi.fn>;
      pause: ReturnType<typeof vi.fn>;
      cancel: ReturnType<typeof vi.fn>;
    }[] = [];
    const animate = vi.fn(() => {
      const animation = { play: vi.fn(), pause: vi.fn(), cancel: vi.fn() };
      handles.push(animation);
      return animation;
    });
    Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
    document.body.innerHTML =
      '<span class="typewriter"><span data-type-letter>A<span data-type-caret></span></span><span data-type-letter>B<span data-type-caret></span></span></span>';
    let hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    const stop = mountTypewriters();
    expect(animate).toHaveBeenCalledTimes(4);
    expect(animate.mock.calls[0]).toEqual([
      expect.arrayContaining([expect.objectContaining({ opacity: 1, offset: MOTION.typewriter.typingShare / 2 })]),
      { duration: 6000, iterations: Infinity },
    ]);
    handles.forEach((h) => expect(h.pause).toHaveBeenCalled());
    const see = (isIntersecting: boolean) =>
      intersections[0].callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
    see(true);
    handles.forEach((h) => expect(h.play).toHaveBeenCalledTimes(1));
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    handles.forEach((h) => expect(h.pause).toHaveBeenCalledTimes(2));
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    see(false);
    expect(document.querySelector(".typewriter")).toHaveAttribute("data-typing", "false");
    stop();
    handles.forEach((h) => expect(h.cancel).toHaveBeenCalledOnce());
    expect(intersections[0].disconnect).toHaveBeenCalledOnce();
    expect(document.querySelector(".typewriter")).not.toHaveAttribute("data-typing");
    document.dispatchEvent(new Event("visibilitychange"));
    handles.forEach((h) => expect(h.pause).toHaveBeenCalledTimes(3));
  });
});
