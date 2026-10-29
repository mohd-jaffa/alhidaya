import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IntroSection } from "@/components/sections/IntroSection";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

describe("IntroSection", () => {
  it("says who the company is, with a photo beside it when there is one", () => {
    const { rerender } = render(
      <IntroSection anchor="about" content={contentFixture("INTRO")} image={imageFixture()} />,
    );
    expect(screen.getByRole("region", { name: "Who we are" })).toBeInTheDocument();
    expect(screen.getByText("A nursing company in Doha.")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");

    rerender(<IntroSection anchor="about" content={contentFixture("INTRO")} image={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
