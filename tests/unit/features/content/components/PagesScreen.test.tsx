import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { PagesScreen } from "@/features/content/components/PagesScreen";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const PAGES = [
  { page: "HOME", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true },
  { page: "PRIVACY", publishedAt: null, unpublishedChanges: true },
  { page: "TERMS", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false },
];

describe("PagesScreen", () => {
  it("lists the pages, each with its address and where it stands, opening its editor (D88)", async () => {
    stubApi(() => ({ data: PAGES }));
    render(<PagesScreen />, { wrapper: WithSWR });
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.pages })).toBeVisible();
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    const home = await screen.findByRole("link", { name: /^Home/ });
    expect(home).toHaveAttribute("href", ADMIN_ROUTES.page("HOME"));
    expect(within(home).getByText("/")).toBeVisible();
    expect(within(home).getByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    expect(within(screen.getByRole("link", { name: /^Privacy/ })).getByText(ADMIN_TEXT.notPublishedYet)).toBeVisible();
    expect(within(screen.getByRole("link", { name: /^Terms/ })).getByText(ADMIN_TEXT.published)).toBeVisible();
  });

  it("says when the list did not load, with Try again", async () => {
    let fails = true;
    stubApi((_, url) =>
      url === ADMIN_API_ROUTES.adminPages && fails
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : { data: PAGES },
    );
    render(<PagesScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("link", { name: /^Home/ })).toBeVisible();
  });
});
