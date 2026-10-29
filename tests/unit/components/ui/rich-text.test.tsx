import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RichText } from "@/components/ui/rich-text";
import type { RichText as RichTextBlocks } from "@/lib/validation";

const en = <T,>(value: T) => ({ en: value });

const blocks: RichTextBlocks = [
  { type: "paragraph", text: en("This notice explains what we collect.\nAnd why.") },
  { type: "heading", text: en("What we collect") },
  { type: "list", items: [en("Your name"), en("Your phone number")] },
  { type: "link", label: en("Contact us"), href: "/contact" },
];

describe("RichText", () => {
  it("draws each block as the admin wrote it, never as HTML", () => {
    render(<RichText blocks={blocks} />);
    expect(screen.getByText(/This notice explains/)).toHaveClass("whitespace-pre-line");
    expect(screen.getByRole("heading", { level: 2, name: "What we collect" })).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Your name", "Your phone number"]);
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
  });

  it("puts its headings under a section's own", () => {
    render(<RichText blocks={blocks} headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "What we collect" })).toBeInTheDocument();
  });

  it("shows markup as the words it is", () => {
    render(<RichText blocks={[{ type: "paragraph", text: en("<b>bold</b>") }]} />);
    expect(screen.getByText("<b>bold</b>")).toBeInTheDocument();
  });
});
