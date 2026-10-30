import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CareersBandSection, HOME_JOBS } from "@/components/sections/CareersBandSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, jobFixture, publishedFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });
const job = (slug: string, open = true) => ({ ...publishedFixture(jobFixture({ slug })), open });

describe("CareersBandSection", () => {
  it("shows the three most recent open jobs as cards beside the way to all of them", () => {
    const jobs = [job("one"), job("two"), job("three"), job("four"), job("closed", false)];
    const content = { ...contentFixture("CAREERS_BAND"), text: en("We are looking for registered nurses.") };
    render(<CareersBandSection anchor="careers" content={content} jobs={jobs} />);
    const region = screen.getByRole("region", { name: "Join us" });
    expect(within(region).getByText("We are looking for registered nurses.")).toBeInTheDocument();
    expect(HOME_JOBS).toBe(3);
    expect(
      within(screen.getByRole("list"))
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["one", "two", "three"].map(ROUTES.job));
    expect(screen.getByRole("link", { name: UI_TEXT.allOpenJobs })).toHaveAttribute("href", ROUTES.careers);
  });

  it("still points to Careers when no job is open", () => {
    render(
      <CareersBandSection anchor="careers" content={contentFixture("CAREERS_BAND")} jobs={[job("closed", false)]} />,
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.allOpenJobs })).toBeInTheDocument();
  });
});
