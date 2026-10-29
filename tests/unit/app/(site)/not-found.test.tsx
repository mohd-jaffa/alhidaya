import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound, { metadata } from "@/app/(site)/not-found";
import { UI_TEXT } from "@/constants/messages";

describe("the not-found page", () => {
  it("says the page is not here, and offers the ways on; search engines leave it out", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: UI_TEXT.notFoundHeadline })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.home })).toHaveAttribute("href", "/");
    expect(metadata).toEqual({ title: UI_TEXT.notFoundTitle, robots: { index: false } });
  });
});
