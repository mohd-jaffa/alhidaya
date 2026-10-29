import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignPanel } from "@/components/ui/sign-panel";

describe("SignPanel", () => {
  it("opens the page: the marker, the headline as its heading, the supporting line and its actions", () => {
    render(
      <SignPanel
        marker="You are here"
        headline="Quality nursing care at your doorstep"
        lede="Nursing care in Doha."
        media={<span role="img" aria-label="A nurse at home" />}
      >
        <a href="tel:+97431306555">Call</a>
      </SignPanel>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Quality nursing care at your doorstep" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You are here")).toBeInTheDocument();
    expect(screen.getByText("Nursing care in Doha.")).toHaveClass("text-on-deep-2");
    expect(screen.getByRole("link", { name: "Call" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "A nurse at home" })).toBeInTheDocument();
  });

  it("can be a section's sign, with nothing but its words", () => {
    const { container } = render(
      <SignPanel marker="Careers" headline="Nursing careers in Doha" level="h2" lede={null} />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
