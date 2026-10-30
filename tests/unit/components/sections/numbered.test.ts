import { describe, expect, it } from "vitest";

import { ordinal } from "@/components/sections/numbered";

describe("ordinal", () => {
  it("numbers a card's place from 01", () => {
    expect([0, 1, 9].map(ordinal)).toEqual(["01", "02", "10"]);
  });
});
