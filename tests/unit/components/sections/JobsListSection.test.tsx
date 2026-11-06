import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobsListSection } from "@/components/sections/JobsListSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture, jobFixture, publishedFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });
const job = (slug: string, open = true) => ({ ...publishedFixture(jobFixture({ slug })), open });

describe("JobsListSection", () => {
  it("adds the approved decorative photo with a shadow and accessible fixed-width dots (D174)", () => {
    const photo = imageFixture();
    const { container, rerender } = render(
      <JobsListSection anchor="jobs" content={contentFixture("JOBS_LIST")} jobs={[]} image={photo} band primary />,
    );
    const heading = screen.getByRole("heading", { level: 1, name: UI_TEXT.openJobs });
    expect(heading.querySelector(".jobs-dots")).toHaveAttribute("aria-hidden", "true");
    expect(heading.querySelectorAll(".jobs-dots > span")).toHaveLength(3);
    expect(container.querySelector(".jobs-photo")).toHaveClass("shadow-careers-photo");
    expect(container.querySelector(".jobs-photo")).not.toHaveClass("border", "border-white");
    expect(container.querySelector(".jobs-photo img")).toHaveAttribute("alt", "");
    rerender(<JobsListSection anchor="jobs" content={contentFixture("JOBS_LIST")} jobs={[]} image={photo} />);
    expect(container.querySelector(".jobs-photo")).toBeNull();
    expect(container.querySelector(".jobs-dots")).toBeNull();
  });
  it("provides the page heading when Careers' opening is hidden (D148)", () => {
    render(<JobsListSection anchor="jobs" content={contentFixture("JOBS_LIST")} jobs={[]} primary />);
    expect(screen.getByRole("heading", { level: 1, name: UI_TEXT.openJobs })).toBeInTheDocument();
  });
  it("lists every open job under the admin's introduction, and offers a general application", () => {
    const content = { ...contentFixture("JOBS_LIST"), intro: en("Each opening lists what it asks for.") };
    render(<JobsListSection anchor="jobs" content={content} jobs={[job("one"), job("closed", false)]} />);
    expect(screen.getByRole("region", { name: UI_TEXT.openJobs })).toBeInTheDocument();
    expect(screen.getByText("Each opening lists what it asks for.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByText("No openings right now.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.generalApplication })).toHaveAttribute("href", ROUTES.applyGeneral);
  });

  it("says so when none is open, and keeps the general application", () => {
    const content = { ...contentFixture("JOBS_LIST"), intro: en("Each opening lists what it asks for.") };
    render(<JobsListSection anchor="jobs" content={content} jobs={[job("closed", false)]} />);
    expect(screen.getByText("No openings right now.")).toBeInTheDocument();
    expect(screen.queryByText("Each opening lists what it asks for.")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.generalApplication })).toBeInTheDocument();
  });

  it("needs no introduction", () => {
    render(<JobsListSection anchor="jobs" content={contentFixture("JOBS_LIST")} jobs={[job("one")]} />);
    expect(screen.getByRole("region").querySelector(".text-lead")).toBeNull();
  });

  it("on Careers, keeps the green panel on a compact pastel-blue backdrop, its jobs on white cards (D174)", () => {
    render(<JobsListSection anchor="jobs" content={contentFixture("JOBS_LIST")} jobs={[job("one")]} band />);
    const band = screen.getByRole("region", { name: UI_TEXT.openJobs });
    expect(band).toHaveClass("bg-leaf-pale");
    expect(band.parentElement).toHaveClass("bg-mist", "py-4", "sm:py-6");
    expect(band.querySelector(".bg-card")).toBeInTheDocument();
  });
});
