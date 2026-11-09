import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/motion/Reveal";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("Reveal", () => {
  it("shows its content as it is, before motion loads or with motion reduced", () => {
    motion.engine = null;
    render(<Reveal className="grid">Care at home</Reveal>);
    expect(screen.getByText("Care at home")).toHaveClass("grid");
  });

  it("rises into place, by opacity and transform only, the first time it scrolls into view", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { unmount } = render(<Reveal>Elderly care</Reveal>);
    const element = screen.getByText("Elderly care");
    act(() => vi.runAllTimers());
    expect(fake.gsap.from).toHaveBeenCalledWith(element, {
      opacity: 0,
      y: MOTION.revealDistance,
      duration: MOTION.duration.reveal,
      delay: 0,
      ease: MOTION.ease.out,
      scrollTrigger: { trigger: element, start: "top 90%", once: true },
    });
    unmount();
    expect(fake.revert).toHaveBeenCalled();
  });

  it("arrives a moment after the one before it in a group (D97)", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    render(<Reveal order={2}>Child care</Reveal>);
    act(() => vi.runAllTimers());
    expect(fake.gsap.from).toHaveBeenCalledWith(
      screen.getByText("Child care"),
      expect.objectContaining({ delay: 2 * MOTION.stagger }),
    );
  });

  it("cancels queued work on navigation and rechecks a block reached before initialization", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { unmount } = render(<Reveal>Queued care</Reveal>);
    unmount();
    act(() => vi.runAllTimers());
    expect(fake.gsap.context).not.toHaveBeenCalled();
    render(<Reveal>Visible now</Reveal>);
    fake.ScrollTrigger.isInViewport.mockReturnValue(true);
    act(() => vi.runAllTimers());
    expect(fake.gsap.context).not.toHaveBeenCalled();
  });

  it("never hides what is already on screen", () => {
    const fake = fakeEngine({ inViewport: true });
    motion.engine = fake.engine;
    render(<Reveal>Palliative care</Reveal>);
    act(() => vi.runAllTimers());
    expect(fake.gsap.from).not.toHaveBeenCalled();
  });
});
