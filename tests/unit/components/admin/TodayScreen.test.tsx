import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TodayScreen } from "@/components/admin/TodayScreen";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";

const log = vi.hoisted(() => vi.fn());
vi.mock("@/components/admin/WaitingToPublish", () => ({
  WaitingToPublish: () => <p>What waits to be published</p>,
}));
vi.mock("@/components/admin/TodayLog", () => ({
  TodayLog: (props: unknown) => {
    log(props);
    return null;
  },
}));

describe("TodayScreen", () => {
  it("opens on what needs the admin, the first page, and says so when nothing does", () => {
    render(<TodayScreen searchParams={{}} />);
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.today })).toBeVisible();
    expect(screen.getByText("What waits to be published")).toBeVisible();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.needsYou })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: ADMIN_TEXT.everything })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.overview}?view=everything`,
    );
    expect(log).toHaveBeenLastCalledWith({
      listKey: `${ADMIN_API_ROUTES.adminToday}?needsYou=true`,
      pageBase: ADMIN_ROUTES.overview,
      empty: { title: ADMIN_TEXT.todayEmpty, body: ADMIN_TEXT.todayEmptyBody },
    });
  });

  it("shows everything that arrived, at the page the address names", () => {
    render(<TodayScreen searchParams={{ view: "everything", page: "3" }} />);
    expect(screen.queryByText("What waits to be published")).toBeNull();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.everything })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: ADMIN_TEXT.needsYou })).toHaveAttribute("href", ADMIN_ROUTES.overview);
    expect(log).toHaveBeenLastCalledWith({
      listKey: `${ADMIN_API_ROUTES.adminToday}?page=3`,
      pageBase: `${ADMIN_ROUTES.overview}?view=everything`,
      empty: { title: ADMIN_TEXT.everythingEmpty, body: ADMIN_TEXT.everythingEmptyBody },
    });
  });
});
