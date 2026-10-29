import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const FILES = [
  "src/assets/brand/logo.svg",
  "src/assets/brand/logo-mark.svg",
  "src/assets/brand/logo-white.svg",
  "src/app/icon.svg",
];
const COLOUR_FILES = FILES.filter((file) => !file.endsWith("logo-white.svg"));

/** The colours sampled from the logo (src/assets/brand/README.md). */
const LOGO_COLOURS = [
  "#1262A9",
  "#2175B9",
  "#2D8DCA",
  "#2072B6",
  "#3194CF",
  "#3AA5DD",
  "#448ECB",
  "#76AA40",
  "#8DB43D",
  "#B9CC34",
  "#37A4DC",
  "#86B43F",
];

describe("the logo files (plan R2.2)", () => {
  it.each(FILES)("%s is plain drawing: no script, link, embedded file or style", (file) => {
    const svg = readFileSync(file, "utf8");
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="')).toBe(true);
    expect(svg).toMatch(/<title>[^<]+<\/title>/);
    expect(svg).not.toMatch(/<script|<foreignObject|<image|<style|href=|on[a-z]+=|javascript:/i);
    const elements = new Set([...svg.matchAll(/<([a-zA-Z]+)/g)].map(([, name]) => name));
    expect([...elements].sort()).toEqual(expect.arrayContaining(["circle", "path", "svg", "title"]));
    for (const element of elements) {
      expect(["circle", "defs", "linearGradient", "path", "stop", "svg", "title"]).toContain(element);
    }
  });

  it.each(COLOUR_FILES)("%s uses only the logo's own colours", (file) => {
    const used = new Set(readFileSync(file, "utf8").match(/#[0-9A-Fa-f]{6}/g));
    for (const colour of used) expect(LOGO_COLOURS).toContain(colour.toUpperCase());
  });

  it("has a white version, the same drawing in white alone, for dark ground", () => {
    const white = readFileSync("src/assets/brand/logo-white.svg", "utf8");
    expect(new Set(white.match(/fill="[^"]+"/g))).toEqual(new Set(['fill="#FFFFFF"']));
    const shapes = (svg: string) => svg.match(/ d="[^"]+"/g);
    expect(shapes(white)).toEqual(shapes(readFileSync("src/assets/brand/logo.svg", "utf8")));
  });

  it("draws the icon in a square", () => {
    const [, , width, height] = readFileSync("src/app/icon.svg", "utf8")
      .match(/viewBox="([^"]+)"/)![1]
      .split(" ")
      .map(Number);
    expect(width).toBe(height);
  });

  it("keeps the full logo's English and Arabic lines", () => {
    expect(readFileSync("src/assets/brand/logo.svg", "utf8").match(/<path /g)).toHaveLength(6);
    expect(readFileSync("src/assets/brand/logo-mark.svg", "utf8").match(/<path /g)).toHaveLength(4);
  });
});
