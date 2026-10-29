import { describe, expect, it } from "vitest";

import { inOrder } from "@/lib/content/ordering";

const item = (id: string, day: number) => ({ id, publishedAt: new Date(Date.UTC(2026, 9, day)) });

describe("inOrder", () => {
  it("follows the published order, then the oldest published first", () => {
    const items = [item("a", 1), item("b", 2), item("c", 3), item("d", 3)];
    expect(inOrder(items, ["c", "a"]).map((entry) => entry.id)).toEqual(["c", "a", "b", "d"]);
    expect(inOrder(items, null).map((entry) => entry.id)).toEqual(["a", "b", "c", "d"]);
    expect(inOrder([item("z", 3), item("y", 3)], []).map((entry) => entry.id)).toEqual(["y", "z"]);
  });
});
