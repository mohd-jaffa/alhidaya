import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { UI_TEXT } from "@/constants/messages";
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

/** The services: one waits to be published, one is archived with changes, and the new order waits too. */
const SERVICES = {
  items: [
    { id: "s1", unpublishedChanges: true, archivedAt: null },
    { id: "s2", unpublishedChanges: false, archivedAt: null },
    { id: "s3", unpublishedChanges: true, archivedAt: "2026-10-29T08:00:00Z" },
  ],
  order: { publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true },
};

/** The jobs: one never published, one as published. */
const JOBS = [
  { id: "j1", unpublishedChanges: true, archivedAt: null },
  { id: "j2", unpublishedChanges: false, archivedAt: null },
];

/** The client logos: one waits, the order as published. */
const CLIENTS = {
  items: [{ id: "c1", unpublishedChanges: true, archivedAt: null }],
  order: { publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false },
};

/** Nothing waits anywhere. */
const NOTHING: Record<string, unknown> = {
  [ADMIN_API_ROUTES.adminPages]: [],
  [ADMIN_API_ROUTES.adminServices]: { items: [], order: { publishedAt: null, unpublishedChanges: false } },
  [ADMIN_API_ROUTES.adminJobs]: [],
  [ADMIN_API_ROUTES.adminClients]: { items: [], order: { publishedAt: null, unpublishedChanges: false } },
  [ADMIN_API_ROUTES.adminSite]: { unpublishedChanges: false },
};

/** The rail's counts: three need the admin, two enquiries and one application are new, one page, two of the services and one job wait. */
const counts = (method: string, url: string): Answer =>
  method === "DELETE"
    ? { data: { signedOut: true } }
    : url === ADMIN_API_ROUTES.adminPages
      ? { data: PAGES }
      : url === ADMIN_API_ROUTES.adminServices
        ? { data: SERVICES }
        : url === ADMIN_API_ROUTES.adminJobs
          ? { data: JOBS }
          : url === ADMIN_API_ROUTES.adminClients
            ? { data: CLIENTS }
            : url === ADMIN_API_ROUTES.adminSite
              ? { data: { unpublishedChanges: true } }
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
  it("lists the sections in ruled groups, each with its mark, the current one marked, each with what waits there", async () => {
    stubApi(counts);
    shell();
    const rail = screen.getAllByRole("navigation", { name: ADMIN_TEXT.navigation })[0];
    // Every section beside its mark (D115); the groups parted by a light rule, under bold headings.
    for (const link of within(rail).getAllByRole("link")) expect(link.querySelector("svg")).not.toBeNull();
    const [, inbox] = [...rail.children];
    expect(inbox).toHaveClass("border-t");
    expect(within(inbox as HTMLElement).getByText(ADMIN_TEXT.inbox)).toHaveClass("font-bold", "text-body");
    const today = within(rail).getByRole("link", { name: /Dashboard/ });
    // Marked by its highlight alone, never in bold (D115).
    expect(today).toHaveClass("bg-leaf", "text-navy");
    expect(today).not.toHaveClass("font-bold");
    expect(today).toHaveAttribute("aria-current", "page");
    expect(today).toHaveAttribute("href", ADMIN_ROUTES.overview);
    await waitFor(() => expect(today).toHaveAccessibleName(`${ADMIN_TEXT.dashboard}${ADMIN_TEXT.needsYouCount(3)}`));
    const enquiries = within(rail).getByRole("link", { name: /Enquiries/ });
    await waitFor(() => expect(enquiries).toHaveTextContent(ADMIN_TEXT.newCount(2)));
    expect(enquiries).not.toHaveAttribute("aria-current");
    const applications = within(rail).getByRole("link", { name: /Applications/ });
    expect(applications).toHaveAttribute("href", ADMIN_ROUTES.applications);
    await waitFor(() => expect(applications).toHaveTextContent(ADMIN_TEXT.newCount(1)));
    const pages = within(rail).getByRole("link", { name: /Pages/ });
    expect(pages).toHaveAttribute("href", ADMIN_ROUTES.pages);
    await waitFor(() => expect(pages).toHaveAccessibleName(`${ADMIN_TEXT.pages}${ADMIN_TEXT.waitingCount(1)}`));
    const services = within(rail).getByRole("link", { name: /Services/ });
    expect(services).toHaveAttribute("href", ADMIN_ROUTES.services);
    await waitFor(() => expect(services).toHaveAccessibleName(`${ADMIN_TEXT.services}${ADMIN_TEXT.waitingCount(2)}`));
    const jobs = within(rail).getByRole("link", { name: /Jobs/ });
    expect(jobs).toHaveAttribute("href", ADMIN_ROUTES.jobs);
    await waitFor(() => expect(jobs).toHaveAccessibleName(`${ADMIN_TEXT.jobs}${ADMIN_TEXT.waitingCount(1)}`));
    const clients = within(rail).getByRole("link", { name: /Client logos/ });
    await waitFor(() => expect(clients).toHaveAccessibleName(`${ADMIN_TEXT.clients}${ADMIN_TEXT.waitingCount(1)}`));
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.media })).toHaveAttribute("href", ADMIN_ROUTES.media);
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.activity })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.activity,
    );
    const settings = within(rail).getByRole("link", { name: /Settings/ });
    await waitFor(() => expect(settings).toHaveAccessibleName(`${ADMIN_TEXT.settings}${ADMIN_TEXT.waitingCount(1)}`));
    expect(screen.getByText(ADMIN_TEXT.signedInAs("Fatima"), { selector: "aside p" })).toBeVisible();
    const profile = within(screen.getByRole("complementary")).getByRole("link", { name: ADMIN_TEXT.profile });
    expect(profile).toHaveAttribute("href", ADMIN_ROUTES.profile);
    expect(profile).not.toHaveAttribute("aria-current");
    expect(profile.querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("main")).toHaveTextContent("Page");
  });

  it("marks only the closest section current: Operations, under Settings, is not Settings too", async () => {
    navigation.pathname = "/admin/settings/operations";
    stubApi((_, url) => ({ data: NOTHING[url] ?? { items: [], total: 0, page: 1, pageSize: 25 } }));
    shell();
    const rail = screen.getAllByRole("navigation", { name: ADMIN_TEXT.navigation })[0];
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.operations })).toHaveAttribute("aria-current", "page");
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.settings })).not.toHaveAttribute("aria-current");
    await waitFor(() =>
      expect(within(rail).getByRole("link", { name: ADMIN_TEXT.settings })).toHaveTextContent(/^Settings$/),
    );
  });

  it("marks a section as current on the pages under it, and shows no count while nothing waits", async () => {
    navigation.pathname = "/admin/enquiries/e-1";
    stubApi((_, url) => ({ data: NOTHING[url] ?? { items: [], total: 0, page: 1, pageSize: 25 } }));
    shell();
    const rail = screen.getAllByRole("navigation", { name: ADMIN_TEXT.navigation })[0];
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.enquiries })).toHaveAttribute("aria-current", "page");
    expect(within(rail).getByRole("link", { name: ADMIN_TEXT.dashboard })).not.toHaveAttribute("aria-current");
    await waitFor(() =>
      expect(within(rail).getByRole("link", { name: ADMIN_TEXT.dashboard })).toHaveTextContent(/^Dashboard$/),
    );
    await waitFor(() =>
      expect(within(rail).getByRole("link", { name: ADMIN_TEXT.services })).toHaveTextContent(/^Services$/),
    );
  });

  it("on a phone names the section and opens the rail as a menu, closing it on the way somewhere", async () => {
    const user = userEvent.setup();
    stubApi(counts);
    shell();
    expect(screen.getByRole("banner")).toHaveTextContent(ADMIN_TEXT.dashboard);
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.menu }));
    const menu = screen.getByRole("dialog", { name: ADMIN_TEXT.menu });
    await user.click(within(menu).getByRole("link", { name: /Enquiries/ }));
    expect(menu).not.toHaveAttribute("open");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.menu }));
    await user.click(within(menu).getByRole("link", { name: ADMIN_TEXT.profile }));
    expect(menu).not.toHaveAttribute("open");
  });

  it("loads the column's logo first: on a short page it is the largest thing drawn", () => {
    stubApi(counts);
    shell();
    const logo = within(screen.getByRole("complementary")).getByRole("img", { name: UI_TEXT.siteName });
    expect(logo).not.toHaveAttribute("loading", "lazy");
  });

  it("shows the build's version beside the panel's name, under the logo (D203)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.0.0");
    stubApi(counts);
    shell();
    const aside = within(screen.getByRole("complementary"));
    // Seen as "Admin panel v1.0.0"; a screen reader hears "version 1.0.0".
    expect(aside.getByText(ADMIN_TEXT.adminVersion("1.0.0"))).toBeVisible();
    expect(aside.getByText(ADMIN_TEXT.adminVersionSaid("1.0.0"))).toHaveClass("sr-only");
    expect(aside.getAllByRole("link")[0]).toHaveTextContent(new RegExp(`${ADMIN_TEXT.admin} v1\\.0\\.0`));
    vi.unstubAllEnvs();
  });

  it("shows no version when the build has none", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "");
    stubApi(counts);
    shell();
    const aside = within(screen.getByRole("complementary"));
    expect(aside.getByText(ADMIN_TEXT.admin)).toBeVisible();
    expect(aside.queryByText(/^v\d/)).toBeNull();
    vi.unstubAllEnvs();
  });

  it("marks the profile as where the admin is on its page, and names it in the phone's bar", () => {
    navigation.pathname = ADMIN_ROUTES.profile;
    stubApi(counts);
    shell();
    const aside = within(screen.getByRole("complementary"));
    expect(aside.getByRole("link", { name: ADMIN_TEXT.profile })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("banner")).toHaveTextContent(ADMIN_TEXT.profile);
  });

  it("asks before logging out, and a cancel keeps the admin signed in (D115)", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(counts);
    shell();
    await user.click(within(screen.getByRole("complementary")).getByRole("button", { name: ADMIN_TEXT.signOut }));
    const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.signOutTitle });
    expect(asked).toHaveTextContent(ADMIN_TEXT.signOutBody);
    await user.click(within(asked).getByRole("button", { name: ADMIN_TEXT.cancel }));
    expect(asked).not.toHaveAttribute("open");
    expect(fetch).not.toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminSession,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("logs out once confirmed, and goes to sign in whether or not the session was still there", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(counts);
    shell();
    const logOut = async () => {
      await user.click(within(screen.getByRole("complementary")).getByRole("button", { name: ADMIN_TEXT.signOut }));
      const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.signOutTitle });
      await user.click(within(asked).getByRole("button", { name: ADMIN_TEXT.signOut }));
    };
    await logOut();
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(ADMIN_ROUTES.login));
    expect(fetch).toHaveBeenCalledWith(ADMIN_API_ROUTES.adminSession, expect.objectContaining({ method: "DELETE" }));

    navigation.replace.mockClear();
    stubApi((method, url) =>
      method === "DELETE"
        ? { status: 401, error: { code: "AUTH_SESSION_REQUIRED", message: "Please sign in." } }
        : counts(method, url),
    );
    // The dialog stays open while the way to sign in loads; asked again, it is confirmed there.
    const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.signOutTitle });
    await user.click(within(asked).getByRole("button", { name: ADMIN_TEXT.signOut }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(ADMIN_ROUTES.login));
  });
});
