import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArrowLink } from "@/components/ui/arrow-link";

describe("ArrowLink", () => {
  it("names where it goes, with an arrow that steps forward and turns for right-to-left pages", () => {
    render(<ArrowLink href="/services">All services</ArrowLink>);
    const link = screen.getByRole("link", { name: "All services" });
    expect(link).toHaveAttribute("href", "/services");
    expect(link).toHaveClass("text-forest", "min-h-touch");
    expect(link.querySelector("svg")).toHaveClass("group-hover:translate-x-1", "rtl:-scale-x-100");
  });

  it("goes to another address as a plain link", () => {
    render(
      <ArrowLink href="https://maps.google.com/?q=Retaj" className="mt-2">
        Open in Google Maps
      </ArrowLink>,
    );
    const link = screen.getByRole("link", { name: "Open in Google Maps" });
    expect(link).toHaveAttribute("href", "https://maps.google.com/?q=Retaj");
    expect(link).toHaveClass("text-forest", "mt-2");
  });
});
