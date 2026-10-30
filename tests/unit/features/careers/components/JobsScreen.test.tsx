import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { EMPLOYMENT_TYPE_LABELS } from "@/constants/statuses";
import { JobsScreen } from "@/features/careers/components/JobsScreen";
import type { JobSummaryItem } from "@/features/careers/types";
import { readableDay } from "@/lib/dates";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const job = (id: string, title: string, overrides: Partial<JobSummaryItem> = {}): JobSummaryItem => ({
  id,
  title,
  slug: id,
  location: "Doha, Qatar",
  employmentType: "FULL_TIME",
  postedOn: "2026-10-28",
  closesOn: null,
  publishedAt: PUBLISHED,
  archivedAt: null,
  unpublishedChanges: false,
  open: true,
  ...overrides,
});

describe("JobsScreen (D92)", () => {
  it("groups the jobs by where they stand, each opening its editor, the archived folded below", async () => {
    stubApi(() => ({
      data: [
        job("j1", "Registered nurse", { closesOn: "2026-11-30" }),
        job("j2", "", { publishedAt: null, unpublishedChanges: true, open: false }),
        job("j3", "School nurse", { open: false }),
        job("j4", "Old posting", { archivedAt: PUBLISHED }),
      ],
    }));
    render(<JobsScreen />, { wrapper: WithSWR });
    const open = await screen.findByRole("region", { name: ADMIN_TEXT.jobsOpen });
    const nurse = within(open).getByRole("link", { name: /Registered nurse/ });
    expect(nurse).toHaveAttribute("href", ADMIN_ROUTES.job("j1"));
    expect(nurse).toHaveTextContent(
      [
        "Doha, Qatar",
        EMPLOYMENT_TYPE_LABELS.FULL_TIME,
        ADMIN_TEXT.postedOnShort(readableDay("2026-10-28")),
        ADMIN_TEXT.closesOnShort(readableDay("2026-11-30")),
      ].join(" · "),
    );
    expect(
      within(screen.getByRole("region", { name: ADMIN_TEXT.jobsDrafts })).getByRole("link", {
        name: new RegExp(ADMIN_TEXT.unnamed),
      }),
    ).toHaveAttribute("href", ADMIN_ROUTES.job("j2"));
    expect(within(screen.getByRole("region", { name: ADMIN_TEXT.jobsClosed })).getByRole("link")).toHaveTextContent(
      "School nurse",
    );
    const archived = screen.getByText(ADMIN_TEXT.archivedCount(1)).closest("details")!;
    expect(within(archived).getByRole("link", { name: /Old posting/ })).toHaveAttribute("href", ADMIN_ROUTES.job("j4"));
    expect(screen.getByRole("link", { name: ADMIN_TEXT.newJob })).toHaveAttribute("href", ADMIN_ROUTES.newJob);
  });

  it("says when there are no jobs yet, and leaves out a group with none", async () => {
    stubApi(() => ({ data: [job("j1", "Registered nurse")] }));
    const { unmount } = render(<JobsScreen />, { wrapper: WithSWR });
    await screen.findByRole("region", { name: ADMIN_TEXT.jobsOpen });
    expect(screen.queryByRole("region", { name: ADMIN_TEXT.jobsClosed })).toBeNull();
    expect(screen.queryByText(ADMIN_TEXT.archivedCount(0))).toBeNull();
    unmount();
    stubApi(() => ({ data: [] }));
    render(<JobsScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.noJobs)).toBeVisible();
  });

  it("waits while the jobs are read, and says when they did not load, with Try again", async () => {
    let fails = true;
    stubApi(() =>
      fails ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } } : { data: [] },
    );
    render(<JobsScreen />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText(ADMIN_TEXT.noJobs)).toBeVisible();
  });
});
