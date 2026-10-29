import { describe, expect, it, vi } from "vitest";

import { loadMotionEngine, startSmoothScroll } from "@/lib/motion/engine";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const loaded = vi.hoisted(() => ({ registerPlugin: vi.fn() }));
vi.mock("gsap", () => ({ gsap: { registerPlugin: loaded.registerPlugin } }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { name: "ScrollTrigger" } }));
vi.mock("lenis", () => ({ default: class Lenis {} }));

describe("loadMotionEngine", () => {
  it("fetches GSAP, ScrollTrigger and Lenis, and registers ScrollTrigger", async () => {
    const engine = await loadMotionEngine();
    expect(loaded.registerPlugin).toHaveBeenCalledWith(engine.ScrollTrigger);
    expect(engine.Lenis).toBeTypeOf("function");
  });
});

describe("startSmoothScroll", () => {
  it("drives Lenis from GSAP's ticker, one frame loop, and tells ScrollTrigger of every scroll", () => {
    const { engine, gsap, ScrollTrigger, lenises } = fakeEngine();
    startSmoothScroll(engine);
    const [lenis] = lenises;
    expect(lenis.options).toMatchObject({ autoRaf: false, lerp: MOTION.lerp, smoothWheel: true, syncTouch: false });
    expect(lenis.on).toHaveBeenCalledWith("scroll", ScrollTrigger.update);
    expect(gsap.ticker.lagSmoothing).toHaveBeenCalledWith(0);

    const tick = gsap.ticker.add.mock.calls[0][0] as (seconds: number) => void;
    tick(1.5);
    expect(lenis.raf).toHaveBeenCalledWith(1500);
  });

  it("jumps to the top at once, and stops cleanly", () => {
    const { engine, gsap, lenises, stopListening } = fakeEngine();
    const scroll = startSmoothScroll(engine);
    scroll.toTop();
    expect(lenises[0].scrollTo).toHaveBeenCalledWith(0, { immediate: true, force: true });

    scroll.stop();
    expect(gsap.ticker.remove).toHaveBeenCalledWith(gsap.ticker.add.mock.calls[0][0]);
    expect(gsap.ticker.lagSmoothing).toHaveBeenLastCalledWith(500, 33);
    expect(stopListening).toHaveBeenCalled();
    expect(lenises[0].destroy).toHaveBeenCalled();
  });
});
