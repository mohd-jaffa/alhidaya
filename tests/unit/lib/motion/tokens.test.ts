import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { MOTION } from "@/lib/motion/tokens";

const css = readFileSync("src/app/globals.css", "utf8");
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];

describe("the motion tokens (plan §30.4)", () => {
  it("are the CSS durations, in seconds", () => {
    expect(`${MOTION.duration.press * 1000}ms`).toBe(token("duration-press"));
    expect(`${MOTION.duration.state * 1000}ms`).toBe(token("duration-state"));
    expect(`${MOTION.duration.reveal * 1000}ms`).toBe(token("duration-reveal"));
    expect(`${MOTION.duration.count * 1000}ms`).toBe(token("duration-count"));
  });

  it("name GSAP's versions of the CSS curves", () => {
    expect(token("ease-out")).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(MOTION.ease.out).toBe("expo.out");
    expect(token("ease-in-out")).toBe("cubic-bezier(0.65, 0, 0.35, 1)");
    expect(MOTION.ease.inOut).toBe("power2.inOut");
  });

  it("keep scroll-linked movement close behind the scroll, the glide short and a group's arrivals close", () => {
    expect(MOTION.scrub).toBeLessThanOrEqual(0.5);
    expect(MOTION.lerp).toBeGreaterThanOrEqual(0.1);
    expect(MOTION.stagger).toBeLessThanOrEqual(0.1);
  });
});
