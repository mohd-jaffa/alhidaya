import { describe, expect, it } from "vitest";

import { DIRECTIONAL_PICTOGRAMS, PICTOGRAMS } from "@/assets/brand/pictograms";

/** Every absolute point a path visits: enough to hold a drawing to its grid. */
function points(path: string): [number, number][] {
  const found: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, command, args] of path.matchAll(/([MLHVCSAZmlhvcsaz])([^MLHVCSAZmlhvcsaz]*)/g)) {
    const n = (args.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    const relative = command === command.toLowerCase();
    const step = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, a: 7, z: 0 }[command.toLowerCase() as "m"];
    for (let i = 0; step > 0 && i + step <= n.length; i += step) {
      const group = n.slice(i, i + step);
      const lower = command.toLowerCase();
      if (lower === "h") x = (relative ? x : 0) + group[0];
      else if (lower === "v") y = (relative ? y : 0) + group[0];
      else {
        const [dx, dy] = group.slice(-2);
        x = (relative ? x : 0) + dx;
        y = (relative ? y : 0) + dy;
      }
      found.push([x, y]);
    }
  }
  return found;
}

describe("the pictograms (plan R2.3)", () => {
  it("are drawn inside the 24-unit grid's 2-unit margin, so a stroke never touches the edge", () => {
    for (const [name, paths] of Object.entries(PICTOGRAMS)) {
      for (const [x, y] of paths.flatMap(points)) {
        expect(x, name).toBeGreaterThanOrEqual(2);
        expect(x, name).toBeLessThanOrEqual(22);
        expect(y, name).toBeGreaterThanOrEqual(2);
        expect(y, name).toBeLessThanOrEqual(22);
      }
    }
  });

  it("cover the three lines, the ways to reach the company and every status", () => {
    expect(Object.keys(PICTOGRAMS)).toEqual(
      expect.arrayContaining(["careAtHome", "staffing", "careers", "phone", "chat", "mail", "location", "clock"]),
    );
    expect(Object.keys(PICTOGRAMS)).toEqual(expect.arrayContaining(["check", "error", "info"]));
    expect(Object.keys(PICTOGRAMS)).toEqual(expect.arrayContaining(["eye", "eyeOff"]));
  });

  it("mirror only drawings that exist", () => {
    for (const name of DIRECTIONAL_PICTOGRAMS) expect(PICTOGRAMS[name]).toBeDefined();
  });
});
