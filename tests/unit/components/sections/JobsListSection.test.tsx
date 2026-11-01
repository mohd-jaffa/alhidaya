import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobsListSection } from "@/components/sections/JobsListSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, jobFixture, publishedFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });
const job = (slug: string, open = true) => ({ ...publishedFixture(jobFixture({ slug })), open });

describe("JobsListSection", () => {
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

  it("on Careers, lies on Home's pale-green band, its jobs on white cards (D135)", () => {
    render(<JobsListSection anchor="jobs" content={contentFixture("JOBS_LIST")} jobs={[job("one")]} band />);
    const band = screen.getByRole("region", { name: UI_TEXT.openJobs });
    expect(band).toHaveClass("bg-leaf-pale");
    expect(band.querySelector(".bg-card")).toBeInTheDocument();
  });
});
