import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignPanel } from "@/components/ui/sign-panel";

describe("SignPanel", () => {
  it("opens the page: the headline standing alone as its heading, the supporting line and its actions", () => {
    const { container } = render(
      <SignPanel
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
    expect(container.querySelector("section > div")?.firstElementChild?.tagName).toBe("H1");
    expect(screen.getByText("Nursing care in Doha.")).toHaveClass("text-on-deep-2");
    expect(screen.getByRole("link", { name: "Call" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "A nurse at home" })).toBeInTheDocument();
  });

  it("can be a section's sign, with nothing but its words", () => {
    const { container } = render(<SignPanel headline="Nursing careers in Doha" level="h2" lede={null} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(container.querySelector("p")).toBeNull();
  });

  it("takes its line's colour: sky blue with navy type, its focus rings navy", () => {
    const { container } = render(<SignPanel tone="sky" headline="Home nursing care" lede="Nurses at home." />);
    expect(container.querySelector("section")).toHaveClass("bg-sky", "text-navy");
    expect(screen.getByText("Nurses at home.")).toHaveClass("text-navy");
  });
});
