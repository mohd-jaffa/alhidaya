import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServiceOpening } from "@/features/services/components/ServiceOpening";
import { imageFixture, serviceFixture } from "@tests/support/fixtures/content";

describe("ServiceOpening", () => {
  it("has no header buttons by default, including records saved before the field existed", () => {
    const legacy = serviceFixture();
    delete (legacy as Partial<typeof legacy>).headerButtons;
    render(<ServiceOpening service={legacy} image={null} />);
    expect(screen.getByRole("heading", { level: 1, name: legacy.name.en })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("shows the published actions over the full-width service photo (D164)", () => {
    const buttons = [
      { label: { en: "Ask about care" }, href: "/contact" },
      { label: { en: "Message us" }, href: "https://wa.me/97431306555" },
    ];
    const { container } = render(
      <ServiceOpening service={serviceFixture({ headerButtons: buttons })} image={imageFixture()} />,
    );
    const opening = within(container.querySelector<HTMLElement>("#start")!);
    expect(opening.getByRole("link", { name: buttons[0].label.en })).toHaveAttribute("href", buttons[0].href);
    expect(opening.getByRole("link", { name: buttons[1].label.en })).toHaveAttribute("rel", "noopener noreferrer");
    expect(container.querySelector("#start")).toHaveClass("opening-blend", "opening-blend--page");
    expect(opening.getByRole("img")).toHaveAttribute("sizes", "100vw");
    expect(opening.getByRole("img")).toHaveAttribute("fetchpriority", "high");
  });
});
