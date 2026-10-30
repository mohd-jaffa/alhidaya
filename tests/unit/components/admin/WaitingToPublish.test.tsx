import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WaitingToPublish } from "@/components/admin/WaitingToPublish";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const ARCHIVED = "2026-10-30T08:00:00Z";

describe("WaitingToPublish", () => {
  it("lists on Today each page, service and job with saved changes not on the website yet, and the order (D86, D92)", async () => {
    stubApi((_, url) => ({
      data:
        url === ADMIN_API_ROUTES.adminPages
          ? [
              { page: "HOME", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true },
              { page: "ABOUT", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false },
            ]
          : url === ADMIN_API_ROUTES.adminServices
            ? {
                items: [
                  { id: "s1", name: "Elderly care", unpublishedChanges: true, archivedAt: null },
                  { id: "s2", name: "", unpublishedChanges: true, archivedAt: null },
                  { id: "s3", name: "Old care", unpublishedChanges: true, archivedAt: ARCHIVED },
                ],
                order: { publishedAt: null, unpublishedChanges: true },
              }
            : [
                { id: "j1", title: "Registered nurse", unpublishedChanges: true, archivedAt: null },
                { id: "j2", title: "", unpublishedChanges: true, archivedAt: null },
                { id: "j3", title: "School nurse", unpublishedChanges: false, archivedAt: null },
              ],
    }));
    render(<WaitingToPublish />, { wrapper: WithSWR });
    const section = await screen.findByRole("region", { name: ADMIN_TEXT.notPublishedYet });
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
    ]);
  });

  it("shows nothing while nothing waits", async () => {
    const fetch = stubApi((_, url) => ({
      data:
        url === ADMIN_API_ROUTES.adminServices
          ? { items: [], order: { publishedAt: null, unpublishedChanges: false } }
          : [],
    }));
    const { container } = render(<WaitingToPublish />, { wrapper: WithSWR });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(container).toBeEmptyDOMElement();
  });
});
