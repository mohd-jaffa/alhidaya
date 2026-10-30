import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WaitingToPublish } from "@/components/admin/WaitingToPublish";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00Z";
const NO_ORDER = { publishedAt: null, unpublishedChanges: false };

/** What each list answers: pages, services, jobs and logos, some waiting, some not, some archived. */
const WAITING: Record<string, unknown> = {
  [ADMIN_API_ROUTES.adminPages]: [
    { page: "HOME", publishedAt: PUBLISHED, unpublishedChanges: true },
    { page: "ABOUT", publishedAt: PUBLISHED, unpublishedChanges: false },
  ],
  [ADMIN_API_ROUTES.adminServices]: {
    items: [
      { id: "s1", name: "Elderly care", unpublishedChanges: true, archivedAt: null },
      { id: "s2", name: "", unpublishedChanges: true, archivedAt: null },
      { id: "s3", name: "Old care", unpublishedChanges: true, archivedAt: PUBLISHED },
    ],
    order: { publishedAt: null, unpublishedChanges: true },
  },
  [ADMIN_API_ROUTES.adminJobs]: [
    { id: "j1", title: "Registered nurse", unpublishedChanges: true, archivedAt: null },
    { id: "j2", title: "", unpublishedChanges: true, archivedAt: null },
    { id: "j3", title: "School nurse", unpublishedChanges: false, archivedAt: null },
  ],
  [ADMIN_API_ROUTES.adminClients]: {
    items: [
      { id: "c1", name: "Doha Hospital", unpublishedChanges: true, archivedAt: null },
      { id: "c2", name: "", unpublishedChanges: true, archivedAt: null },
    ],
    order: { publishedAt: PUBLISHED, unpublishedChanges: true },
  },
  [ADMIN_API_ROUTES.adminSite]: { unpublishedChanges: true },
};

const NOTHING: Record<string, unknown> = {
  [ADMIN_API_ROUTES.adminPages]: [],
  [ADMIN_API_ROUTES.adminServices]: { items: [], order: NO_ORDER },
  [ADMIN_API_ROUTES.adminJobs]: [],
  [ADMIN_API_ROUTES.adminClients]: { items: [], order: NO_ORDER },
  [ADMIN_API_ROUTES.adminSite]: { unpublishedChanges: false },
};

describe("WaitingToPublish", () => {
  it("lists on Today each page, service, job, logo and Settings with saved changes not on the website yet, and the orders (D86, D92)", async () => {
    stubApi((_, url) => ({ data: WAITING[url] }));
    render(<WaitingToPublish />, { wrapper: WithSWR });
    const section = await screen.findByRole("region", { name: ADMIN_TEXT.notPublishedYet });
    await within(section).findByRole("link", { name: "Doha Hospital" });
    await within(section).findByRole("link", { name: ADMIN_TEXT.settings });
    await within(section).findByRole("link", { name: "Registered nurse" });
    expect(
      within(section)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Home", ADMIN_ROUTES.page("HOME")],
      [ADMIN_TEXT.servicesOrder, ADMIN_ROUTES.services],
      ["Elderly care", ADMIN_ROUTES.service("s1")],
      [ADMIN_TEXT.unnamed, ADMIN_ROUTES.service("s2")],
      ["Registered nurse", ADMIN_ROUTES.job("j1")],
      [ADMIN_TEXT.unnamed, ADMIN_ROUTES.job("j2")],
      [ADMIN_TEXT.clientsOrder, ADMIN_ROUTES.clients],
      ["Doha Hospital", ADMIN_ROUTES.client("c1")],
      [ADMIN_TEXT.unnamed, ADMIN_ROUTES.client("c2")],
      [ADMIN_TEXT.settings, ADMIN_ROUTES.settings],
    ]);
  });

  it("shows nothing while nothing waits", async () => {
    const fetch = stubApi((_, url) => ({ data: NOTHING[url] }));
    const { container } = render(<WaitingToPublish />, { wrapper: WithSWR });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(5));
    expect(container).toBeEmptyDOMElement();
  });
});
