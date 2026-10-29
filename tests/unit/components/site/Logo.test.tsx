import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "@/components/site/Logo";
import { UI_TEXT } from "@/constants/messages";

describe("Logo", () => {
  it("is the company's name to a screen reader, in colour on light ground", () => {
    render(<Logo className="h-10" priority />);
    const logo = screen.getByRole("img", { name: UI_TEXT.siteName });
    expect(logo.getAttribute("src")).toMatch(/logo\.svg/);
    expect(logo).toHaveClass("h-10");
  });

  it("is in white on navy", () => {
    render(<Logo variant="white" />);
    expect(screen.getByRole("img", { name: UI_TEXT.siteName }).getAttribute("src")).toMatch(/logo-white\.svg/);
  });
});
