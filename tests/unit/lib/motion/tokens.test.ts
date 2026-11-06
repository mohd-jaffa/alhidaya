import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { MOTION } from "@/lib/motion/tokens";

const css = readFileSync("src/app/globals.css", "utf8");
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];

describe("the motion tokens (plan §30.4)", () => {
  it("halves the hero clock while keeping the pyramid and other photo drift at six seconds", () => {
    expect(token("duration-slide")).toBe("6s");
    expect(token("duration-hero-slide")).toBe("3s");
    expect(css).toContain(".slides-band {\n  --duration-slide: var(--duration-hero-slide);");
  });
  it("are the CSS durations, in seconds", () => {
    expect(`${MOTION.duration.press * 1000}ms`).toBe(token("duration-press"));
    expect(`${MOTION.duration.state * 1000}ms`).toBe(token("duration-state"));
    expect(`${MOTION.duration.reveal * 1000}ms`).toBe(token("duration-reveal"));
    expect(`${MOTION.duration.typewriter}s`).toBe(token("duration-typewriter"));
  });

  it("name GSAP's versions of the CSS curves", () => {
    expect(token("ease-out")).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(MOTION.ease.out).toBe("expo.out");
    expect(token("ease-in-out")).toBe("cubic-bezier(0.65, 0, 0.35, 1)");
    expect(MOTION.ease.inOut).toBe("power2.inOut");
  });

  it("keep the glide short, a group's arrivals close and a heading's words closer (D129)", () => {
    expect(MOTION.lerp).toBeGreaterThanOrEqual(0.1);
    expect(MOTION.stagger).toBeLessThanOrEqual(0.1);
    expect(MOTION.wordStagger).toBeLessThan(MOTION.stagger);
  });
});
