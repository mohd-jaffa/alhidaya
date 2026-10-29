import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");

/** Every colour token, by name. */
const colours = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6});/g)].map(([, name, hex]) => [name, hex]),
);

/** WCAG 2 relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(colours[foreground]), luminance(colours[background])].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe("the design tokens (plan §30.2)", () => {
  it("are the logo's colours, their navy ink and the error red, and nothing else", () => {
    expect(Object.keys(colours).sort()).toEqual(
      [
        "deep",
        "sky",
        "leaf",
        "navy",
        "ink-2",
        "ground",
        "mist",
        "rule",
        "on-deep",
        "on-deep-2",
        "focus",
        "focus-on-deep",
        "error",
      ].sort(),
    );
    expect(colours).toMatchObject({ deep: "#0f64ac", sky: "#33a0da", leaf: "#86ae3c" });
  });

  it("remove Tailwind's own palette, sizes, shadows and eases, so no component can pick its own", () => {
    for (const namespace of ["color", "font", "text", "shadow", "radius", "ease", "animate"]) {
      expect(css).toContain(`--${namespace}-*: initial;`);
    }
  });

  it("pass WCAG AA for every text pairing the design uses", () => {
    for (const [text, surface] of [
      ["navy", "ground"],
      ["navy", "mist"],
      ["ink-2", "ground"],
      ["ink-2", "mist"],
      ["deep", "ground"],
      ["on-deep", "deep"],
      ["on-deep-2", "deep"],
      ["on-deep", "navy"],
      ["navy", "sky"],
      ["navy", "leaf"],
      ["error", "ground"],
      ["error", "mist"],
      ["on-deep", "error"],
    ]) {
      expect(contrast(text, surface), `${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keep white text off sky blue and leaf green, where it would fail", () => {
    expect(contrast("on-deep", "sky")).toBeLessThan(4.5);
    expect(contrast("on-deep", "leaf")).toBeLessThan(4.5);
  });

  it("give focus rings and field borders 3:1 against what they sit on (WCAG 1.4.11)", () => {
    expect(contrast("focus", "ground")).toBeGreaterThanOrEqual(3);
    expect(contrast("focus", "mist")).toBeGreaterThanOrEqual(3);
    expect(contrast("focus-on-deep", "deep")).toBeGreaterThanOrEqual(3);
    expect(contrast("ink-2", "ground")).toBeGreaterThanOrEqual(3);
    expect(contrast("error", "ground")).toBeGreaterThanOrEqual(3);
  });

  it("set the site in Atkinson Hyperlegible Next, with tabular figures available (plan D61)", () => {
    expect(css).toContain("--font-sans: var(--font-atkinson)");
    expect(readFileSync("src/app/layout.tsx", "utf8")).toContain(
      "atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght-normal.woff2",
    );
  });
});
