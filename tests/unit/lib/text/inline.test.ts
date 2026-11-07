import { describe, expect, it } from "vitest";

import { inlineCharacters, parseInline, plainText, sliceInline } from "@/lib/text/inline";

describe("limited inline copy formatting", () => {
  it("indexes visible Unicode letters without splitting surrogate pairs", () => {
    expect(inlineCharacters("A😀")).toEqual([
      { letter: "A", start: 0, end: 1 },
      { letter: "😀", start: 1, end: 3 },
    ]);
    expect(inlineCharacters("ب", 4)).toEqual([{ letter: "ب", start: 4, end: 5 }]);
    expect(inlineCharacters("")).toEqual([]);
  });
  it.each([
    ["ordinary care", "ordinary care"],
    ["", ""],
    ["**bold**", "bold"],
    ["*italic*", "italic"],
    ["***both***", "both"],
    ["**quality nursing** care", "quality nursing care"],
    ["**bold *italic* still bold**", "bold italic still bold"],
    ["*italic **bold** italic*", "italic bold italic"],
    ["**a ***both*** b**", "a both b"],
    ["**hello**,*world*!", "hello,world!"],
    ["Care **day\nand night**", "Care day\nand night"],
    ["**unclosed", "**unclosed"],
    ["closing**", "closing**"],
    ["* list item", "* list item"],
    ["2 * 3 * 4", "2 * 3 * 4"],
    ["** spaced **", "** spaced **"],
    ["****literal****", "****literal****"],
    ["**", "**"],
    ["***", "***"],
    ["**unclosed *valid*", "**unclosed valid"],
    [String.raw`\*literal\*`, "*literal*"],
    [String.raw`\**literal\**`, "*literal*"],
    ["back\\\\slash\\", "back\\slash\\"],
    ["**رعاية 😀**", "رعاية 😀"],
    ["<script>**text**</script>", "<script>text</script>"],
  ])("projects %j to plain text without interpreting HTML", (input, expected) => {
    expect(plainText(input)).toBe(expected);
  });

  it("retains nested styles, coalesces adjacent runs and preserves unmatched delimiters", () => {
    expect(parseInline("**bold *italic* still bold** plain ***both***")).toEqual([
      { text: "bold ", format: 2 },
      { text: "italic", format: 3 },
      { text: " still bold", format: 2 },
      { text: " plain ", format: 0 },
      { text: "both", format: 3 },
    ]);
    expect(parseInline("**one****two**")).toEqual([{ text: "one****two", format: 2 }]);
    expect(parseInline("***unmatched **nested**")).toEqual([
      { text: "***unmatched ", format: 0 },
      { text: "nested", format: 2 },
    ]);
  });

  it("slices visible ranges without losing styles or mutating the input", () => {
    const runs = parseInline("plain **bold** *italic*");
    expect(sliceInline(runs, 4, 13)).toEqual([
      { text: "n ", format: 0 },
      { text: "bold", format: 2 },
      { text: " ", format: 0 },
      { text: "it", format: 1 },
    ]);
    expect(sliceInline(runs, 100, 101)).toEqual([]);
    expect(sliceInline(runs, 3, 3)).toEqual([]);
    expect(runs.map((run) => run.text).join("")).toBe("plain bold italic");
  });

  it("handles long malformed marker sequences without recursion", () => {
    const text = "*".repeat(100_000) + " unmatched \\";
    expect(plainText(text)).toBe(text);
  });
});
