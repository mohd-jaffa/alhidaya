import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { ApplicationsScreen } from "@/features/careers/components/ApplicationsScreen";

const log = vi.hoisted(() => vi.fn());
const filters = vi.hoisted(() => vi.fn());
vi.mock("@/features/careers/components/ApplicationLog", () => ({
  ApplicationLog: (props: unknown) => {
    log(props);
    return null;
  },
}));
vi.mock("@/features/careers/components/ApplicationFilters", () => ({
  ApplicationFilters: (props: unknown) => {
    filters(props);
    return null;
  },
}));

const JOB = "0f8c1c62-5d55-4b8e-9c3a-2f4e1d6b7a90";

describe("ApplicationsScreen", () => {
  it("lists every application by default, with the statuses to narrow it, the job and a search", () => {
    render(<ApplicationsScreen searchParams={{}} />);
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.applications })).toBeVisible();
    const statuses = screen.getByRole("navigation", { name: ADMIN_TEXT.applications });
    expect(within(statuses).getByRole("link", { name: ADMIN_TEXT.allStatuses })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(statuses).getByRole("link", { name: "Shortlisted" })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.applications}?status=SHORTLISTED`,
    );
    const query = { status: undefined, job: undefined, q: undefined, page: 1 };
    expect(filters).toHaveBeenLastCalledWith({ query });
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query,
        pageBase: ADMIN_ROUTES.applications,
        initiallyOpen: null,
        empty: { title: ADMIN_TEXT.applicationsEmpty, body: ADMIN_TEXT.applicationsEmptyBody },
      }),
    );
  });

  it("keeps the job and search when the status changes, and opens a named application", () => {
    render(<ApplicationsScreen searchParams={{ status: "NEW", job: JOB, q: " Mariam ", page: "2" }} open="a-1" />);
    const statuses = screen.getByRole("navigation", { name: ADMIN_TEXT.applications });
    expect(within(statuses).getByRole("link", { name: "New" })).toHaveAttribute("aria-current", "page");
    expect(within(statuses).getByRole("link", { name: "Closed" })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.applications}?status=CLOSED&job=${JOB}&q=Mariam`,
    );
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: { status: "NEW", job: JOB, q: "Mariam", page: 2 },
        pageBase: `${ADMIN_ROUTES.applications}?status=NEW&job=${JOB}&q=Mariam`,
        initiallyOpen: "a-1",
        empty: { title: ADMIN_TEXT.nothingFound, body: ADMIN_TEXT.nothingFoundBody },
      }),
    );
  });

  it("takes the general applications as a job, and ignores a job or status it does not know", () => {
    render(<ApplicationsScreen searchParams={{ job: "general" }} />);
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ job: "general" }) }),
    );
    render(<ApplicationsScreen searchParams={{ job: "nurse", status: "RESOLVED" }} />);
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: { status: undefined, job: undefined, q: undefined, page: 1 } }),
    );
  });
});
