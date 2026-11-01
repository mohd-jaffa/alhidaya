import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntroSection } from "@/components/sections/IntroSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

const en = <T,>(value: T) => ({ en: value });

describe("IntroSection (D129)", () => {
  it("says who the company is, with a photo under its heading when there is one", () => {
    const { rerender } = render(
      <IntroSection anchor="about" content={contentFixture("INTRO")} image={imageFixture()} />,
    );
    expect(screen.getByRole("region", { name: "Who we are" })).toBeInTheDocument();
    expect(screen.getByText("A nursing company in Doha.")).toHaveClass("text-lead");
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(<IntroSection anchor="about" content={contentFixture("INTRO")} image={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("sets its phrase in blue, the rest of its words beneath the lead, its points ruled, and the way to About", () => {
    const content = {
      ...contentFixture("INTRO"),
      heading: en("About Al Hidaya Health Care Service"),
      highlight: en("Al Hidaya Health Care Service"),
      body: [
        { type: "paragraph" as const, text: en("A nursing company in Doha.") },
        { type: "paragraph" as const, text: en("Care plans that fit.") },
      ],
      points: [
        { title: en("Committed to our patients"), text: en("Care with dignity.") },
        { title: en("Committed to excellence"), text: en(null) },
      ],
    };
    render(<IntroSection anchor="about" content={content} image={null} more={ROUTES.about} />);
    const section = screen.getByRole("region", { name: "About Al Hidaya Health Care Service" });
    expect(section.querySelector("h2 .text-deep")).toHaveTextContent("Al");
    expect(within(section).getByText("Care plans that fit.")).not.toHaveClass("text-lead");
    const points = within(section).getAllByRole("listitem");
    expect(points).toHaveLength(2);
    expect(points[0]).toHaveTextContent("Care with dignity.");
    expect(screen.getByRole("link", { name: UI_TEXT.readAboutUs })).toHaveAttribute("href", ROUTES.about);
  });

  it("draws text that does not open with a paragraph whole, in the quieter ink", () => {
    const content = {
      ...contentFixture("INTRO"),
      body: [{ type: "list" as const, items: [en("Home care"), en("Staffing")] }],
    };
    render(<IntroSection anchor="about" content={content} image={null} />);
    expect(screen.getByText("Home care").closest(".text-ink-2")).not.toBeNull();
  });
});
