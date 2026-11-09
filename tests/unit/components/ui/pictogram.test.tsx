import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pictogram } from "@/components/ui/pictogram";

describe("Pictogram", () => {
  it("uses the proper shared WhatsApp brand SVG for the retained chat key", () => {
    const { container } = render(<Pictogram name="chat" />);
    expect(container.querySelector("use")).toHaveAttribute("href", "/brand/whatsapp.svg#mark");
    expect(container.querySelector("use")).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("is decoration, hidden from screen readers, when words beside it say what it means", () => {
    const { container } = render(<Pictogram name="phone" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg).toHaveClass("size-6");
    expect(svg.querySelector("use")).toHaveAttribute("href", "/brand/pictograms.svg#phone");
  });

  it("is an image with a name when given a label", () => {
    render(<Pictogram name="error" label="Error" size="sm" className="text-error" />);
    const image = screen.getByRole("img", { name: "Error" });
    expect(image).not.toHaveAttribute("aria-hidden");
    expect(image).toHaveClass("size-5", "text-error");
  });

  it("draws in the colour of the text around it, at one stroke weight", () => {
    const { container } = render(<Pictogram name="careAtHome" size="lg" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("stroke-width", "2");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveClass("size-10");
  });

  it("mirrors the ones that point somewhere for right-to-left pages, and only those", () => {
    const { container } = render(
      <>
        <Pictogram name="arrow" size="xl" />
        <Pictogram name="chat" />
      </>,
    );
    const [arrow, chat] = container.querySelectorAll("svg");
    expect(arrow).toHaveClass("rtl:-scale-x-100", "size-14");
    expect(chat).not.toHaveClass("rtl:-scale-x-100");
  });
});
