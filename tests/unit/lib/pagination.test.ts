import { describe, expect, it } from "vitest";

import { pageFrom } from "@/lib/pagination";

describe("pageFrom", () => {
  it("reads a whole page number from 2, and anything else as the first page", () => {
    expect(pageFrom("4")).toBe(4);
    for (const value of [undefined, "1", "0", "-2", "1.5", "x", ["2"]]) expect(pageFrom(value)).toBe(1);
  });
});
