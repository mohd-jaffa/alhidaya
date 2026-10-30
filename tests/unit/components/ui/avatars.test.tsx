import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatars } from "@/components/ui/avatars";
import { imageFixture } from "@tests/support/fixtures/content";

describe("Avatars (D97)", () => {
  it("lays faces over one another, each saying nothing to a screen reader", () => {
    const faces = [
      { ...imageFixture("A nurse"), id: "a" },
      { ...imageFixture("A carer"), id: "b" },
    ];
    const { container } = render(<Avatars images={faces} size="lg" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("size-14", "rounded-full");
    expect([...container.querySelectorAll("img")].map((img) => img.getAttribute("alt"))).toEqual(["", ""]);
  });

  it("draws nothing without a face", () => {
    const { container } = render(<Avatars images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
