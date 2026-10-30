import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/routes";
import { ApplicationFilters } from "@/features/careers/components/ApplicationFilters";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => vi.unstubAllGlobals());

const JOB = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";

describe("ApplicationFilters", () => {
  it("offers every job with applications, the general ones and a search, as a plain form keeping the status", async () => {
    stubApi(() => ({
      data: { items: [], total: 0, page: 1, pageSize: 25, jobs: [{ id: JOB, title: "School Nurse" }] },
    }));
    render(<ApplicationFilters query={{ status: "NEW", job: JOB, q: "Mariam" }} />, { wrapper: WithSWR });
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("action", ADMIN_ROUTES.applications);
    expect(form).toHaveAttribute("method", "get");
    // Drawn again once the jobs arrive, with the job in the address chosen.
    expect(await within(form).findByRole("option", { name: "School Nurse" })).toBeInTheDocument();
    const job = within(form).getByRole("combobox", { name: ADMIN_TEXT.job });
    expect(job).toHaveValue(JOB);
    expect(job).toHaveAccessibleDescription(ADMIN_TEXT.jobHint);
    expect([...job.querySelectorAll("option")].map((option) => option.textContent)).toEqual([
      ADMIN_TEXT.allJobs,
      ADMIN_TEXT.generalApplications,
      "School Nurse",
    ]);
    expect(within(form).getByRole("searchbox", { name: ADMIN_TEXT.search })).toHaveValue("Mariam");
    expect(form.querySelector('input[name="status"]')).toHaveValue("NEW");
  });

  it("starts on all jobs, with no status to keep, before the jobs arrive", () => {
    stubApi(() => ({ status: 500, error: { code: "INTERNAL_ERROR", message: "x" } }));
    render(<ApplicationFilters query={{}} />, { wrapper: WithSWR });
    expect(screen.getByRole("combobox", { name: ADMIN_TEXT.job })).toHaveValue("");
    expect(screen.getByRole("searchbox", { name: ADMIN_TEXT.search })).toHaveValue("");
    expect(screen.getByRole("search").querySelector('input[name="status"]')).toBeNull();
  });
});
