import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { markedWords, Words } from "@/components/motion/Words";

describe("markedWords (D128)", () => {
  it("numbers each word in order and marks those in the highlighted phrase", () => {
    expect(markedWords("Quality nursing care at your doorstep.", "nursing care")).toEqual([
      { word: "Quality", marked: false, index: 0 },
      { word: "nursing", marked: true, index: 1 },
      { word: "care", marked: true, index: 2 },
      { word: "at", marked: false, index: 3 },
      { word: "your", marked: false, index: 4 },
      { word: "doorstep.", marked: false, index: 5 },
    ]);
  });

  it("marks nothing when the phrase is missing from the text, or none is given", () => {
    expect(markedWords("Elderly care", "palliative").every((word) => !word.marked)).toBe(true);
    expect(markedWords("Elderly care", null)).toHaveLength(2);
  });
});

describe("Words (D128)", () => {
  it("reads the text once, whole, and draws each word in its own clipped box, the phrase in deep blue", () => {
    const { container } = render(<Words text="Care for your loved ones." highlight="loved ones." />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("Care for your loved ones.");
    expect(container.querySelectorAll(".rise-word")).toHaveLength(5);
    expect([...container.querySelectorAll(".text-deep")].map((word) => word.textContent)).toEqual(["loved", "ones."]);
    expect(container.querySelector("[data-word]")).toHaveStyle({ "--i": "0" });
  });
});
