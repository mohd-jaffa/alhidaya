import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RichTextSection, textParts } from "@/components/sections/RichTextSection";
import { contentFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("RichTextSection", () => {
  const body = [
    { type: "heading" as const, text: en("What we collect") },
    { type: "paragraph" as const, text: en("Your name.") },
  ];

  it("with a heading, names the section and puts the text's headings under it", () => {
    render(<RichTextSection anchor="text" content={{ heading: en("Privacy"), body }} />);
    expect(screen.getByRole("region", { name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "What we collect" })).toBeInTheDocument();
  });

  it("without one, the text's headings are the page's", () => {
    const { container } = render(<RichTextSection anchor="text" content={{ ...contentFixture("RICH_TEXT"), body }} />);
    expect(screen.getByRole("heading", { level: 2, name: "What we collect" })).toBeInTheDocument();
    expect(container.querySelector("section")).not.toHaveAttribute("aria-labelledby");
  });

  it("rises in parts, each heading with the words under it, the words before the first a part of their own (D125)", () => {
    const paragraph = (text: string) => ({ type: "paragraph" as const, text: { en: text } });
    const heading = (text: string) => ({ type: "heading" as const, text: { en: text } });
    expect(
      textParts([paragraph("Before"), heading("One"), paragraph("A"), paragraph("B"), heading("Two")]).map((part) =>
        part.map((block) => ("text" in block ? block.text.en : null)),
      ),
    ).toEqual([["Before"], ["One", "A", "B"], ["Two"]]);
    expect(textParts([])).toEqual([]);
  });

  it("on Careers, lies on Home's pastel-blue band (D135)", () => {
    render(<RichTextSection anchor="text" content={{ heading: en("Before you apply"), body }} band />);
    expect(screen.getByRole("region", { name: "Before you apply" })).toHaveClass("bg-mist");
  });
});
