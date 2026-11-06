import { describe, expect, it, vi } from "vitest";

import { loadMotionEngine } from "@/lib/motion/engine";

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
