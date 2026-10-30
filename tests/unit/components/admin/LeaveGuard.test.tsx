/* eslint-disable @next/next/no-html-link-for-pages -- plain links stand for every link the guard meets, Next's own included. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LeaveGuard } from "@/components/admin/LeaveGuard";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { stubDialogs } from "@tests/support/api";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeAll(stubDialogs);

function page(active: boolean) {
  const reached = vi.fn();
  render(
    <div onClick={(event) => (event.preventDefault(), reached())}>
      <LeaveGuard active={active} />
      <a href="/admin/enquiries?page=2">Enquiries</a>
      <a href="/admin/pages/home#seo">This page</a>
      <a href="https://alhidaya.qa/">The website</a>
      <a href="/admin/pages" target="_blank">
        New tab
      </a>
      <a href="/api/admin/applications/a-1/cv" download>
        CV
      </a>
      <span>Words</span>
    </div>,
  );
  return reached;
}

describe("LeaveGuard", () => {
  it("lets every link through while nothing is unsaved", async () => {
    const reached = page(false);
    await userEvent.click(screen.getByRole("link", { name: "Enquiries" }));
    expect(reached).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before another admin page is opened with unsaved changes: Stay keeps them, Leave goes (D88)", async () => {
    window.history.replaceState(null, "", "/admin/pages/home");
    const reached = page(true);
    await userEvent.click(screen.getByRole("link", { name: "Enquiries" }));
    expect(reached).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.leaveTitle });
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.stay }));
    expect(dialog).not.toHaveAttribute("open");
    expect(push).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("link", { name: "Enquiries" }));
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.leave }));
    expect(push).toHaveBeenCalledWith("/admin/enquiries?page=2");
  });

  it("lets through a link on the same page, to another site, to a new tab or a download, a modified click, and no link", async () => {
    window.history.replaceState(null, "", "/admin/pages/home");
    const reached = page(true);
    for (const name of ["This page", "The website", "New tab", "CV"]) {
      await userEvent.click(screen.getByRole("link", { name }));
    }
    fireEvent.click(screen.getByRole("link", { name: "Enquiries" }), { ctrlKey: true });
    fireEvent.click(screen.getByRole("link", { name: "Enquiries" }), { button: 1 });
    await userEvent.click(screen.getByText("Words"));
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(reached).toHaveBeenCalledTimes(7);
    expect(screen.queryByRole("dialog", { name: ADMIN_TEXT.leaveTitle })).toBeNull();
  });

  it("has the browser ask before the tab is closed or reloaded", () => {
    page(true);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
