import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scheduleMotion } from "@/lib/motion/schedule";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("motion initialization scheduling", () => {
  it("yields before setup and disposes the created context", () => {
    const cleanup = vi.fn();
    const setup = vi.fn(() => cleanup);
    const cancel = scheduleMotion(setup);
    expect(setup).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(setup).toHaveBeenCalledOnce();
    cancel();
    expect(cleanup).toHaveBeenCalledOnce();
  });
  it("cancels setup before it can touch a navigated or reduced-motion page", () => {
    const setup = vi.fn();
    const cancel = scheduleMotion(setup);
    cancel();
    vi.runAllTimers();
    expect(setup).not.toHaveBeenCalled();
  });
  it("accepts initialization that leaves visible content alone", () => {
    const cancel = scheduleMotion(() => undefined);
    vi.runAllTimers();
    expect(cancel).not.toThrow();
  });
});
