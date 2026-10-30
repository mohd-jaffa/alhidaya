import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

const navigation = vi.hoisted(() => ({ pathname: "/admin", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
  navigation.replace.mockClear();
  navigation.pathname = "/admin";
});

/** The pages: Home has changes waiting to be published, About is as published. */
const PAGES = [
  { page: "HOME", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true },
  { page: "ABOUT", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false },
];

/** The rail's counts: three need the admin, two enquiries and one application are new, one page waits. */
const counts = (method: string, url: string): Answer =>
  method === "DELETE"
    ? { data: { signedOut: true } }
    : url === ADMIN_API_ROUTES.adminPages
      ? { data: PAGES }
      : {
          data: {
            items: [],
            total: url.includes("needsYou") ? 3 : url.startsWith(ADMIN_API_ROUTES.adminApplications) ? 1 : 2,
            page: 1,
            pageSize: 25,
          },
        };

const shell = () =>
  render(
    <AdminShell adminName="Fatima">
      <h1>Page</h1>
    </AdminShell>,
    { wrapper: WithSWR },
  );

describe("AdminShell", () => {
  it("lays the sections on the line, the current one marked, each with what waits there", async () => {
    stubApi(counts);
    shell();
    const rail = screen.getAllByRole("navigation", { name: ADMIN_TEXT.navigation })[0];
    const today = within(rail).getByRole("link", { name: /Today/ });
    expect(today).toHaveAttribute("aria-current", "page");
    expect(today).toHaveAttribute("href", ADMIN_ROUTES.overview);
    await waitFor(() => expect(today).toHaveAccessibleName(`${ADMIN_TEXT.today}${ADMIN_TEXT.needsYouCount(3)}`));
    const enquiries = within(rail).getByRole("link", { name: /Enquiries/ });
    await waitFor(() => expect(enquiries).toHaveTextContent(ADMIN_TEXT.newCount(2)));
    expect(enquiries).not.toHaveAttribute("aria-current");
    const applications = within(rail).getByRole("link", { name: /Applications/ });
    expect(applications).toHaveAttribute("href", ADMIN_ROUTES.applications);
    await waitFor(() => expect(applications).toHaveTextContent(ADMIN_TEXT.newCount(1)));
    const pages = within(rail).getByRole("link", { name: /Pages/ });
    expect(pages).toHaveAttribute("href", ADMIN_ROUTES.pages);
    await waitFor(() => expect(pages).toHaveAccessibleName(`${ADMIN_TEXT.pages}${ADMIN_TEXT.waitingCount(1)}`));
    expect(screen.getByText(ADMIN_TEXT.signedInAs("Fatima"), { selector: "aside p" })).toBeVisible();
    expect(screen.getByRole("main")).toHaveTextContent("Page");
  });

  it("marks a section as current on the pages under it, and shows no count while nothing waits", async () => {
    navigation.pathname = "/admin/enquiries/e-1";
    stubApi((_, url) => ({
      data: url === ADMIN_API_ROUTES.adminPages ? [] : { items: [], total: 0, page: 1, pageSize: 25 },
    }));
    shell();
    const rail = screen.getAllByRole("navigation", { name: ADMIN_TEXT.navigation })[0];
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.enquiries })).toHaveAttribute("aria-current", "page");
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.today })).not.toHaveAttribute("aria-current");
    await waitFor(() =>
      expect(within(rail).getByRole("link", { name: ADMIN_TEXT.today })).toHaveTextContent(/^Today$/),
    );
  });

  it("on a phone names the section and opens the rail as a menu, closing it on the way somewhere", async () => {
    const user = userEvent.setup();
    stubApi(counts);
    shell();
    expect(screen.getByRole("banner")).toHaveTextContent(ADMIN_TEXT.today);
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.menu }));
    const menu = screen.getByRole("dialog", { name: ADMIN_TEXT.menu });
    await user.click(within(menu).getByRole("link", { name: /Enquiries/ }));
    expect(menu).not.toHaveAttribute("open");
  });

  it("signs out, and goes to sign in whether or not the session was still there", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(counts);
    shell();
    await user.click(within(screen.getByRole("complementary")).getByRole("button", { name: ADMIN_TEXT.signOut }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(ADMIN_ROUTES.login));
    expect(fetch).toHaveBeenCalledWith(ADMIN_API_ROUTES.adminSession, expect.objectContaining({ method: "DELETE" }));

    navigation.replace.mockClear();
    stubApi((method, url) =>
      method === "DELETE"
        ? { status: 401, error: { code: "AUTH_SESSION_REQUIRED", message: "Please sign in." } }
        : counts(method, url),
    );
    await user.click(within(screen.getByRole("complementary")).getByRole("button", { name: ADMIN_TEXT.signOut }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(ADMIN_ROUTES.login));
  });
});
