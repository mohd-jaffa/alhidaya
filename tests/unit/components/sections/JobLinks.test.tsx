import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobLinks } from "@/components/sections/JobLinks";
import { ROUTES } from "@/constants/routes";
import { jobFixture, publishedFixture } from "@tests/support/fixtures/content";

const open = <T,>(record: T) => ({ ...record, open: true });

describe("JobLinks", () => {
  it("lists each job with where, its terms and when it closes, each row the link to the job", () => {
    const closing = open(publishedFixture(jobFixture({ slug: "night-nurse", closesOn: "2026-11-30" })));
    const ongoing = open(publishedFixture(jobFixture({ slug: "day-nurse", employmentType: "CONTRACT" })));
    render(<JobLinks jobs={[closing, ongoing]} />);
    const [first, second] = screen.getAllByRole("listitem");
    expect(within(first).getByRole("link")).toHaveAttribute("href", ROUTES.job("night-nurse"));
    expect(first).toHaveTextContent("Doha, Qatar·Full time·Closes 30 November 2026");
    expect(second).toHaveTextContent("Doha, Qatar·Contract");
    expect(second).not.toHaveTextContent("Closes");
  });
});
