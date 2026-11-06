import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageSplit } from "@/components/sections/PageSplit";
import { imageFixture } from "@tests/support/fixtures/content";

describe("PageSplit (D135)", () => {
  it("uses the full-width image for the approved blended opening only when a photo exists (D158)", () => {
    const { container, rerender } = render(
      <PageSplit anchor="start" label="About" headline="Care in Doha" image={imageFixture()} blend />,
    );
    expect(container.querySelector("section")).toHaveClass("opening-blend", "opening-blend--page");
    expect(screen.getByRole("img")).toHaveAttribute("sizes", "100vw");
    rerender(<PageSplit anchor="start" label="About" headline="Care in Doha" blend />);
    expect(container.querySelector(".opening-blend")).toBeNull();
  });
  it("opens under a rule: the page's name, the headline with its phrase in deep blue, the line, the actions and the photo first", () => {
    const { container } = render(
      <PageSplit
        anchor="start"
        label="Services"
        headline="Care at home, and nurses for institutions"
        highlight="Care at home"
        lede="Nursing care across Doha."
        image={imageFixture("A nurse at a bedside")}
      >
        <button type="button">Request a quote</button>
      </PageSplit>,
    );
    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("id", "start");
    expect(section).toHaveClass("border-t");
    expect(screen.getByText("Services")).toHaveClass("text-deep");
    expect(
      screen.getByRole("heading", { level: 1, name: "Care at home, and nurses for institutions" }),
    ).toBeInTheDocument();
    expect([...container.querySelectorAll("h1 .text-deep")].map((word) => word.textContent)).toEqual([
      "Care",
      "at",
      "home",
    ]);
    expect(screen.getByText("Nursing care across Doha.")).toHaveClass("split-line");
    expect(screen.getByRole("button", { name: "Request a quote" }).parentElement).toHaveClass("split-line");
    expect(screen.getByRole("img", { name: "A nurse at a bedside" })).toHaveAttribute("fetchpriority", "high");
  });

  it("stands its words alone at the site's width without a photo, and leaves out a name the headline already says", () => {
    const { container } = render(<PageSplit anchor="start" label="Privacy" headline="Privacy notice" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector(".max-w-site")).toBeInTheDocument();
    expect(screen.getAllByText("Privacy notice")).toHaveLength(1);
    expect(container.querySelector(".split-line")).toBeNull();
  });
});
