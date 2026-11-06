import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntroSection } from "@/components/sections/IntroSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

const en = <T,>(value: T) => ({ en: value });

describe("IntroSection (D129)", () => {
  it("places Home's existing points together in one full-width card, with the link after it", () => {
    const content = {
      ...contentFixture("INTRO"),
      points: Array.from({ length: 6 }, (_, at) => ({
        title: en(`Commitment ${at + 1}`),
        text: en(at === 5 ? null : `Statement ${at + 1}`),
      })),
    };
    render(<IntroSection anchor="about" content={content} image={null} pointCards more={ROUTES.about} />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("rounded-card", "bg-card", "md:grid-cols-3");
    expect(list.parentElement).toHaveClass("intro-point-card", "lg:col-span-2");
    expect(list.closest(".intro-copy")).toBeNull();
    expect(within(list).getAllByRole("listitem")).toHaveLength(6);
    expect(list.querySelector("svg")).toBeNull();
    expect(within(list).getByText("Statement 1")).toBeVisible();
    expect(within(list).getByText("Commitment 6")).toBeVisible();
    const link = screen.getByRole("link", { name: UI_TEXT.readAboutUs });
    expect(link).toHaveAttribute("href", ROUTES.about);
    expect(list.nextElementSibling).toBe(link);
  });

  it("leaves no empty card or extra row when Home has no points", () => {
    const { container } = render(
      <IntroSection anchor="about" content={contentFixture("INTRO")} image={null} pointCards more={ROUTES.about} />,
    );
    expect(screen.queryByRole("list")).toBeNull();
    expect(container.querySelector(".intro-point-card")).toBeNull();
    expect(screen.getByRole("link", { name: UI_TEXT.readAboutUs }).closest(".intro-copy")).not.toBeNull();
  });

  it("aligns About's description to the photo only while a photo exists", () => {
    const { rerender } = render(
      <IntroSection anchor="about" content={contentFixture("INTRO")} image={imageFixture()} alignToPhoto />,
    );
    expect(screen.getByRole("region")).toHaveClass("intro-align-photo");
    rerender(<IntroSection anchor="about" content={contentFixture("INTRO")} image={null} alignToPhoto />);
    expect(screen.getByRole("region")).not.toHaveClass("intro-align-photo");
  });
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
    expect(points[0].querySelector("svg")).not.toBeNull();
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
