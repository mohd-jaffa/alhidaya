import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RiseWordsMotion } from "@/components/motion/RiseWordsMotion";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("RiseWordsMotion", () => {
  it("shows its server-drawn children before the motion engine loads", () => {
    motion.engine = null;
    const { container } = render(
      <RiseWordsMotion>
        <strong>Care</strong>
      </RiseWordsMotion>,
    );
    expect(container.querySelector("strong")).toHaveTextContent("Care");
  });

  it("enhances its server-drawn word slots and cleans up on unmount", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { container, unmount } = render(
      <RiseWordsMotion>
        <span data-word>Care</span>
      </RiseWordsMotion>,
    );
    act(() => vi.runAllTimers());
    expect(fake.gsap.from).toHaveBeenCalledWith(container.querySelectorAll("[data-word]"), expect.any(Object));
    unmount();
    expect(fake.revert).toHaveBeenCalled();
  });

  it("leaves visible content in place", () => {
    const fake = fakeEngine({ inViewport: true });
    motion.engine = fake.engine;
    render(
      <RiseWordsMotion>
        <span>Care</span>
      </RiseWordsMotion>,
    );
    act(() => vi.runAllTimers());
    expect(fake.gsap.from).not.toHaveBeenCalled();
  });
});
