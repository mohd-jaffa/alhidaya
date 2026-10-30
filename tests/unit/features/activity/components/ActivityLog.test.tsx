import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ActivityLog } from "@/features/activity/components/ActivityLog";
import type { ActivityItem } from "@/features/activity/types";
import { dohaDayHeading } from "@/lib/dates";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const entry = (id: string, createdAt: string, action: ActivityItem["action"]): ActivityItem => ({
  id,
  createdAt,
  who: "Fatima",
  action,
  subject: { type: "account" },
  changed: [],
  to: null,
  counts: null,
});

describe("ActivityLog (D96)", () => {
  it("reads the kind and page asked for, and rules the changes by day, newest first", async () => {
    const fetch = stubApi(() => ({
      data: {
        items: [
          entry("a2", "2026-10-30T09:00:00.000Z", "SIGN_OUT"),
          entry("a1", "2026-10-29T09:00:00.000Z", "SIGN_IN"),
        ],
        total: 52,
        page: 2,
        pageSize: 50,
      },
    }));
    render(
      <ActivityLog
        query={{ kind: "SIGN_INS", page: 2 }}
        pageBase={`${ADMIN_ROUTES.activity}?kind=SIGN_INS`}
        empty={{ title: ADMIN_TEXT.activityKindEmpty, body: ADMIN_TEXT.activityKindEmptyBody }}
      />,
      { wrapper: WithSWR },
    );
    expect(await screen.findByRole("heading", { level: 3, name: ADMIN_TEXT.didSignOut })).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(`${ADMIN_API_ROUTES.adminActivity}?kind=SIGN_INS&page=2`, expect.anything());
    const days = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(days).toEqual([
      dohaDayHeading(new Date("2026-10-30T09:00:00.000Z")),
      dohaDayHeading(new Date("2026-10-29T09:00:00.000Z")),
    ]);
    expect(screen.getByRole("link", { name: ADMIN_TEXT.newer })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.activity}?kind=SIGN_INS`,
    );
  });

  it("says when there is nothing yet", async () => {
    stubApi(() => ({ data: { items: [], total: 0, page: 1, pageSize: 50 } }));
    render(
      <ActivityLog
        query={{}}
        pageBase={ADMIN_ROUTES.activity}
        empty={{ title: ADMIN_TEXT.activityEmpty, body: ADMIN_TEXT.activityEmptyBody }}
      />,
      { wrapper: WithSWR },
    );
    expect(await screen.findByText(ADMIN_TEXT.activityEmpty)).toBeVisible();
  });
});
