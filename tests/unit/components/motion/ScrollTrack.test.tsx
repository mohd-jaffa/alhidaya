import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScrollTrack } from "@/components/motion/ScrollTrack";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

function track(held: boolean) {
  return render(
    <section>
      <ScrollTrack held={held} as="ol" className="px-6" trackClassName="gap-4">
        <li>One</li>
        <li>Two</li>
      </ScrollTrack>
    </section>,
  );
}

// jsdom lays nothing out: each test makes the row wider than its place, or not, by hand.
describe("ScrollTrack (D97)", () => {
  it("is a row swiped or scrolled sideways before motion loads, its items a list", () => {
    motion.engine = null;
    track(false);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveClass("flex", "gap-4");
    expect(list.parentElement).toHaveClass("overflow-x-auto", "px-6");
  });

  it("takes focus itself, named, when nothing in it can, so the keyboard can scroll it", () => {
    motion.engine = null;
    render(
      <ScrollTrack label="How it works" as="ol">
        <li>One</li>
      </ScrollTrack>,
    );
    expect(screen.getByRole("region", { name: "How it works" })).toHaveAttribute("tabindex", "0");
  });

  it("needs no classes of its own", () => {
    motion.engine = null;
    render(
      <ScrollTrack>
        <span>Only</span>
      </ScrollTrack>,
    );
    expect(screen.getByText("Only").parentElement?.tagName).toBe("DIV");
  });

  it("drifts sideways with the scroll on a wide screen, and is swiped again when it leaves", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1200);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    const { unmount } = track(false);
    const list = screen.getByRole("list");
    const place = list.parentElement!;
    expect(place.style.overflow).toBe("hidden");
    const [target, options] = fake.gsap.to.mock.calls[0] as [HTMLElement, { x: () => number; scrollTrigger: object }];
    expect(target).toBe(list);
    expect(options.x()).toBe(-400);
    expect(options.scrollTrigger).toEqual(
      expect.objectContaining({ trigger: place, start: "top bottom", end: "bottom top", scrub: MOTION.scrub }),
    );
    unmount();
    expect(fake.media.revert).toHaveBeenCalled();
    expect(place.style.overflow).toBe("");
    vi.restoreAllMocks();
  });

  it("holds its section while the row passes, for as long as the row is wider than its place", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1500);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1000);
    const { container } = track(true);
    const options = fake.gsap.to.mock.calls[0][1] as { scrollTrigger: { pin: Element; end: () => string } };
    expect(options.scrollTrigger.pin).toBe(container.querySelector("section"));
    expect(options.scrollTrigger.end()).toBe("+=500");
    vi.restoreAllMocks();
  });

  it("stays still when the row fits, and on a narrow screen", () => {
    const fits = fakeEngine();
    motion.engine = fits.engine;
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    track(true);
    expect(fits.gsap.to).not.toHaveBeenCalled();
    vi.restoreAllMocks();

    const narrow = fakeEngine({ wide: false });
    motion.engine = narrow.engine;
    track(true);
    expect(narrow.gsap.to).not.toHaveBeenCalled();
  });
});
