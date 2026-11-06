import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ValuesSection } from "@/components/sections/ValuesSection";
import { contentFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ValuesSection", () => {
  it("renders About's approved three-panel commitments without list markers (D177)", () => {
    const content = {
      ...contentFixture("VALUES"),
      items: [
        { title: en("Our patients"), text: en("Care with dignity.") },
        { title: en("Leadership"), text: en("Our people and relationships.") },
        { title: en("Excellence"), text: en(null) },
      ],
    };
    render(<ValuesSection anchor="values" content={content} panels />);
    expect(screen.queryByRole("list")).toBeNull();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    for (const [index, tone] of ["bg-deep", "bg-leaf-pale", "bg-mist"].entries()) {
      expect(cards[index]).toHaveClass("promise-card", "rounded-card", tone);
      expect(
        within(cards[index]).getByRole("heading", { level: 3, name: content.items[index].title.en }),
      ).toBeInTheDocument();
    }
    expect(within(cards[0]).getByText("Care with dignity.")).toHaveClass("text-on-deep-2");
    expect(within(cards[1]).getByText("Our people and relationships.")).toHaveClass("text-ink-2");
    expect(cards[2].querySelector("p")).toBeNull();
  });
  it("lists each value, its title as a heading and its line when it has one", () => {
    const content = contentFixture("VALUES");
    content.items.push({ title: en("Compassion and dignity"), text: en("Every patient, with respect.") });
    render(<ValuesSection anchor="values" content={content} />);
    const items = within(screen.getByRole("region", { name: "Why us" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole("heading", { level: 3, name: "Day and night" })).toBeInTheDocument();
    expect(items[0].querySelector("p")).toBeNull();
    expect(within(items[1]).getByText("Every patient, with respect.")).toBeInTheDocument();
  });
});
