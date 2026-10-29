import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ValuesSection } from "@/components/sections/ValuesSection";
import { contentFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ValuesSection", () => {
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
