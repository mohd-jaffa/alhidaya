import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { markedWords, Words } from "@/components/motion/Words";

describe("markedWords (D128)", () => {
  it("numbers each word in order and marks those in the highlighted phrase", () => {
    expect(markedWords("Quality nursing care at your doorstep.", "nursing care")).toEqual([
      { word: "Quality", marked: false, index: 0, spaceBefore: false },
      { word: "nursing", marked: true, index: 1, spaceBefore: true },
      { word: "care", marked: true, index: 2, spaceBefore: true },
      { word: "at", marked: false, index: 3, spaceBefore: true },
      { word: "your", marked: false, index: 4, spaceBefore: true },
      { word: "doorstep.", marked: false, index: 5, spaceBefore: true },
    ]);
  });

  it("keeps a comma after the phrase against it, as the text has it (D135)", () => {
    const words = markedWords("Care at home, and nurses", "Care at home");
    expect(words.map(({ word, spaceBefore }) => [word, spaceBefore])).toEqual([
      ["Care", false],
      ["at", true],
      ["home", true],
      [",", false],
      ["and", true],
      ["nurses", true],
    ]);
    const { container } = render(<Words text="Care at home, and nurses" highlight="Care at home" />);
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("Care at home, and nurses");
    // The comma stays on the line of the word before it.
    expect(container.querySelector(".whitespace-nowrap")).toHaveTextContent("home,");
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
