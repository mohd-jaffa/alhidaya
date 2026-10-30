import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { ActivityScreen } from "@/features/activity/components/ActivityScreen";

const log = vi.hoisted(() => vi.fn());
vi.mock("@/features/activity/components/ActivityLog", () => ({
  ActivityLog: (props: unknown) => {
    log(props);
    return null;
  },
}));

describe("ActivityScreen (D96)", () => {
  it("shows everything by default, with the kinds to narrow it to", () => {
    render(<ActivityScreen searchParams={{}} />);
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.activity })).toBeVisible();
    const kinds = screen.getByRole("navigation", { name: ADMIN_TEXT.activity });
    expect(within(kinds).getByRole("link", { name: ADMIN_TEXT.allActivity })).toHaveAttribute("aria-current", "page");
    expect(within(kinds).getByRole("link", { name: ADMIN_TEXT.activityKinds.SIGN_INS })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.activity}?kind=SIGN_INS`,
    );
    expect(log).toHaveBeenLastCalledWith({
      query: { kind: undefined, page: 1 },
      pageBase: ADMIN_ROUTES.activity,
      empty: { title: ADMIN_TEXT.activityEmpty, body: ADMIN_TEXT.activityEmptyBody },
    });
  });

  it("narrows to one kind from the address, a page at a time, and ignores a kind it does not know", () => {
    const { unmount } = render(<ActivityScreen searchParams={{ kind: "INBOX", page: "2" }} />);
    const kinds = screen.getByRole("navigation", { name: ADMIN_TEXT.activity });
    expect(within(kinds).getByRole("link", { name: ADMIN_TEXT.activityKinds.INBOX })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(kinds).getByRole("link", { name: ADMIN_TEXT.allActivity })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.activity,
    );
    expect(log).toHaveBeenLastCalledWith({
      query: { kind: "INBOX", page: 2 },
      pageBase: `${ADMIN_ROUTES.activity}?kind=INBOX`,
      empty: { title: ADMIN_TEXT.activityKindEmpty, body: ADMIN_TEXT.activityKindEmptyBody },
    });
    unmount();
    render(<ActivityScreen searchParams={{ kind: "PAGES" }} />);
    expect(log).toHaveBeenLastCalledWith(expect.objectContaining({ query: { kind: undefined, page: 1 } }));
  });
});
