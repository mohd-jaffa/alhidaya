import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClientsSection } from "@/components/sections/ClientsSection";
import { clientFixture, contentFixture, imageFixture, publishedFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ClientsSection", () => {
  it("shows each logo named by its organisation, linked to its site when it has one", () => {
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
    expect(screen.getByRole("link", { name: "Doha Clinic" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("img", { name: "A school" }).closest("a")).toBeNull();
    expect(screen.queryByRole("img", { name: "Gone" })).not.toBeInTheDocument();
  });

  it("is not shown at all until there are logos", () => {
    const { container } = render(
      <ClientsSection anchor="clients" content={contentFixture("CLIENTS")} clients={[]} images={new Map()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
