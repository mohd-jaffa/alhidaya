import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkipLink } from "@/components/site/SkipLink";
import { UI_TEXT } from "@/constants/messages";

describe("SkipLink", () => {
  it("jumps past the header to the page's content, shown when focused", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: UI_TEXT.skipToContent });
    expect(link).toHaveAttribute("href", "#main");
    expect(link).toHaveClass("-translate-y-[200%]", "focus:translate-y-0");
  });
});
