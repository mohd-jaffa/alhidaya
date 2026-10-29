import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { headingId, SectionFrame, SectionHeading } from "@/components/sections/SectionFrame";

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
