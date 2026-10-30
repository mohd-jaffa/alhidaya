import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatementSection } from "@/components/sections/StatementSection";
import { contentFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

describe("StatementSection (D97)", () => {
  it("says the statement at its anchor, large and centred, its darker phrases darker", () => {
    const { container } = render(<StatementSection anchor="statement" content={contentFixture("STATEMENT")} />);
    expect(container.firstElementChild).toHaveAttribute("id", "statement");
    const statement = container.querySelector("p")!;
    expect(statement).toHaveClass("text-statement", "text-center");
    expect(statement.textContent?.replace(/\s+/g, " ")).toContain("We bring nursing");
    expect(screen.getAllByText("nursing")[1]).toHaveClass("text-navy");
  });
});
