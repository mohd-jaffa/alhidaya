import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { headingId, SectionBand, SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";

describe("SectionFrame", () => {
  it("is a region named by its heading, at its anchor", () => {
    render(
      <SectionFrame anchor="values" className="grid">
        <SectionHeading anchor="values">Why Al Hidaya</SectionHeading>
      </SectionFrame>,
    );
    const region = screen.getByRole("region", { name: "Why Al Hidaya" });
    expect(region).toHaveAttribute("id", "values");
    expect(region).toHaveClass("grid");
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", headingId("values"));
  });

  it("names nothing when it has no one heading", () => {
    const { container } = render(
      <SectionFrame anchor="mission" named={false}>
        <p>Text</p>
      </SectionFrame>,
    );
    expect(container.querySelector("section")).not.toHaveAttribute("aria-labelledby");
  });
});

describe("SectionBand (D135)", () => {
  it("lays its colour edge to edge, its content at the site's width, named by its heading or by nothing", () => {
    const { container, rerender } = render(
      <SectionBand anchor="mission" tone="mist" className="grid">
        <SectionHeading anchor="mission">Our mission</SectionHeading>
      </SectionBand>,
    );
    const band = screen.getByRole("region", { name: "Our mission" });
    expect(band).toHaveClass("bg-mist");
    expect(band.firstElementChild).toHaveClass("max-w-site", "grid");
    rerender(
      <SectionBand anchor="talk" tone="leaf" named={false}>
        <p>Text</p>
      </SectionBand>,
    );
    expect(container.querySelector("section")).toHaveClass("bg-leaf-pale");
    expect(container.querySelector("section")).not.toHaveAttribute("aria-labelledby");
  });
});
