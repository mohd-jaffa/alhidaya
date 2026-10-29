import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InstitutionsSection } from "@/components/sections/InstitutionsSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

describe("InstitutionsSection", () => {
  it("offers staffing on the deep-blue line and ends on Request a Quote", () => {
    const { container, rerender } = render(
      <InstitutionsSection anchor="institutions" content={contentFixture("INSTITUTIONS")} image={imageFixture()} />,
    );
    expect(screen.getByRole("region", { name: "For institutions" })).toBeInTheDocument();
    expect(screen.getByText("Nurse staffing.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
    expect(container.querySelector(".bg-deep")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img")).toBeInTheDocument();

    rerender(<InstitutionsSection anchor="institutions" content={contentFixture("INSTITUTIONS")} image={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
