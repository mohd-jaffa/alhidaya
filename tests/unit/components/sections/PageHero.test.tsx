import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHero } from "@/components/sections/PageHero";
import { imageFixture } from "@tests/support/fixtures/content";

describe("PageHero", () => {
  it("sets the page's name on its pill above the headline, the supporting line, the actions and the photo", () => {
    const { container } = render(
      <PageHero
        anchor="start"
        label="About"
        headline="Nursing care with compassion"
        highlight="compassion"
        lede="A nursing care company in Doha."
        image={imageFixture("A nurse with a patient")}
      >
        <button type="button">Request a quote</button>
      </PageHero>,
    );
    expect(container.querySelector("section#start")).toBeInTheDocument();
    expect(screen.getByText("About")).toHaveClass("bg-leaf-pale");
    expect(screen.getByRole("heading", { level: 1, name: "Nursing care with compassion" })).toBeInTheDocument();
    expect(screen.getByText("A nursing care company in Doha.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request a quote" }).parentElement).toHaveClass("flex");
    expect(screen.getByRole("img", { name: "A nurse with a patient" })).toHaveAttribute("fetchpriority", "high");
    expect(container.querySelector(".lg\\:grid-cols-\\[1fr_1\\.04fr\\]")).toBeInTheDocument();
  });

  it("stands its words alone without a photo, and leaves out a pill the headline already says", () => {
    const { container } = render(<PageHero anchor="start" label="Careers" headline="Nursing careers in Doha" />);
    expect(screen.getByRole("heading", { level: 1, name: "Nursing careers in Doha" })).toBeInTheDocument();
    expect(container.querySelector(".bg-leaf-pale")).not.toBeInTheDocument();
    expect(container.querySelector(".text-lead")).not.toBeInTheDocument();
    expect(container.querySelector(".flex-wrap")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
