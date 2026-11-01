import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ClientsSection } from "@/components/sections/ClientsSection";
import { clientFixture, contentFixture, imageFixture, publishedFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

const en = <T,>(value: T) => ({ en: value });

describe("ClientsSection (D133)", () => {
  it("shows each logo named by its organisation, a logo with a site opening it, under the heading", () => {
    const linked = publishedFixture(clientFixture({ name: en("Doha Clinic"), url: "https://dohaclinic.example" }));
    const plain = publishedFixture(clientFixture({ name: en("A school") }));
    const gone = publishedFixture(clientFixture({ name: en("Gone") }));
    const images = new Map([
      [linked.published.logo.mediaId, imageFixture("Logo")],
      [plain.published.logo.mediaId, imageFixture("")],
    ]);
    render(
      <ClientsSection
        anchor="clients"
        content={contentFixture("CLIENTS")}
        clients={[linked, plain, gone]}
        images={images}
      />,
    );
    expect(screen.getByRole("region", { name: "Our clients" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Doha Clinic" })).toHaveAttribute("href", "https://dohaclinic.example");
    expect(screen.getByRole("button", { name: "A school" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: "Gone" })).not.toBeInTheDocument();
  });

  it("is not shown at all until there are logos", () => {
    const { container } = render(
      <ClientsSection anchor="clients" content={contentFixture("CLIENTS")} clients={[]} images={new Map()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
