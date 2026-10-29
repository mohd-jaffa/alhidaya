import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { EnquiryLog } from "@/features/enquiries/components/EnquiryLog";
import type { EnquiryListItem } from "@/features/enquiries/types";
import { type Answer, stubApi, WithSWR } from "@tests/support/api";

vi.mock("@/features/enquiries/components/EnquiryOpened", () => ({
  EnquiryOpened: ({ id }: { id: string }) => <p>Opened {id}</p>,
}));

afterEach(() => vi.unstubAllGlobals());

const item = (id: string, createdAt: string, name = "Omar Haddad"): EnquiryListItem => ({
  id,
  form: "QUOTE",
  status: "NEW",
  emailStatus: "SENT",
  name,
  email: "omar@school.qa",
  phone: "+97455512345",
  summary: "",
  createdAt,
});

const page = (items: EnquiryListItem[], total = items.length, at = 1): Answer => ({
  data: { items, total, page: at, pageSize: 25 },
});

const EMPTY = { title: "Nothing here", body: "It arrives here." };

const log = (props: Partial<Parameters<typeof EnquiryLog>[0]> = {}) =>
  render(<EnquiryLog query={{ needsYou: true }} pageBase="/admin?view=everything" empty={EMPTY} {...props} />, {
    wrapper: WithSWR,
  });

describe("EnquiryLog", () => {
  it("rules the arrivals by their day in Doha, newest first, one open at a time", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(() =>
      page([
        item("e-3", "2026-10-29T08:01:00Z"),
        item("e-2", "2026-10-28T21:30:00Z", "Mariam Ali"),
        item("e-1", "2026-10-28T15:20:00Z", "Fatima Al-Kuwari"),
      ]),
    );
    log();
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    const thursday = await screen.findByRole("region", { name: "Thursday 29 October 2026" });
    expect(within(thursday).getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("region", { name: "Wednesday 28 October 2026" })).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(`${API_ROUTES.adminEnquiries}?needsYou=true`, expect.anything());

    await user.click(screen.getByRole("button", { name: /Omar Haddad/ }));
    expect(screen.getByText("Opened e-3")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Mariam Ali/ }));
    expect(screen.queryByText("Opened e-3")).not.toBeInTheDocument();
    expect(screen.getByText("Opened e-2")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Mariam Ali/ }));
    expect(screen.queryByText(/Opened/)).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("says what will arrive when the list is empty", async () => {
    stubApi(() => page([]));
    log();
    expect(await screen.findByText(EMPTY.title)).toBeVisible();
    expect(screen.getByText(EMPTY.body)).toBeVisible();
  });

  it("says when the list did not load, and tries again", async () => {
    const user = userEvent.setup();
    let fail = true;
    stubApi(() =>
      fail ? { status: 500, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } } : page([]),
    );
    log();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.loadFailed);
    expect(alert).toHaveTextContent("Something went wrong.");
    fail = false;
    await user.click(within(alert).getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText(EMPTY.title)).toBeVisible();
  });

  it("leads to newer and older pages on the list's own address", async () => {
    stubApi(() => page([item("e-30", "2026-10-29T08:01:00Z")], 60, 2));
    log({ query: { page: 2 } });
    const pager = await screen.findByRole("navigation", { name: ADMIN_TEXT.pageOf(2, 3) });
    expect(within(pager).getByRole("link", { name: ADMIN_TEXT.newer })).toHaveAttribute(
      "href",
      "/admin?view=everything",
    );
    expect(within(pager).getByRole("link", { name: ADMIN_TEXT.older })).toHaveAttribute(
      "href",
      "/admin?view=everything&page=3",
    );
  });

  it("shows only the way back on the last page", async () => {
    stubApi(() => page([item("e-1", "2026-10-29T08:01:00Z")], 30, 2));
    log({ query: { page: 2 }, pageBase: "/admin/enquiries?status=NEW" });
    const pager = await screen.findByRole("navigation", { name: ADMIN_TEXT.pageOf(2, 2) });
    expect(within(pager).getByRole("link")).toHaveAttribute("href", "/admin/enquiries?status=NEW");
    expect(within(pager).queryByRole("link", { name: ADMIN_TEXT.older })).not.toBeInTheDocument();
  });

  it("opens the enquiry an address named: in its row when it is listed", async () => {
    stubApi(() => page([item("e-1", "2026-10-29T08:01:00Z")]));
    log({ initiallyOpen: "e-1" });
    expect(await screen.findByText("Opened e-1")).toBeVisible();
    expect(screen.getByRole("button", { name: /Omar Haddad/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("opens the enquiry an address named above the list when it is not on this page, even an empty one", async () => {
    stubApi((method, url) =>
      url === API_ROUTES.adminEnquiry("e-9")
        ? {
            data: {
              id: "e-9",
              form: "CONTACT",
              status: "IN_PROGRESS",
              emailStatus: "SENT",
              name: "Nadia Rahman",
              email: "nadia@example.com",
              phone: "+97433334444",
              fields: [],
              notes: [],
              createdAt: "2026-10-26T09:00:00Z",
              updatedAt: "2026-10-26T09:00:00Z",
            },
          }
        : page([]),
    );
    log({ initiallyOpen: "e-9" });
    const named = await screen.findByRole("article", { name: ADMIN_TEXT.messageFrom("Nadia Rahman") });
    expect(named).toHaveTextContent("26 October 2026 at 12:00");
    expect(named).toHaveTextContent("In progress");
    expect(within(named).getByText("Opened e-9")).toBeVisible();
    expect(screen.queryByText(EMPTY.title)).not.toBeInTheDocument();
  });

  it("names a named quote as a quote, and says when the named enquiry cannot be found", async () => {
    stubApi((method, url) =>
      url === API_ROUTES.adminEnquiry("gone")
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: "This item no longer exists." } }
        : url === API_ROUTES.adminEnquiry("e-8")
          ? {
              data: {
                id: "e-8",
                form: "QUOTE",
                status: "NEW",
                emailStatus: "SENT",
                name: "Omar Haddad",
                email: "o@x.qa",
                phone: "+97455512345",
                fields: [],
                notes: [],
                createdAt: "2026-10-26T09:00:00Z",
                updatedAt: "2026-10-26T09:00:00Z",
              },
            }
          : page([item("e-1", "2026-10-29T08:01:00Z")]),
    );
    const { unmount } = log({ initiallyOpen: "e-8" });
    expect(await screen.findByRole("article", { name: ADMIN_TEXT.quoteFrom("Omar Haddad") })).toBeVisible();
    unmount();
    log({ initiallyOpen: "gone" });
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("This item no longer exists."));
  });

  it("shows only the way on from the first page", async () => {
    stubApi(() => page([item("e-1", "2026-10-29T08:01:00Z")], 30, 1));
    log({ pageBase: "/admin" });
    const pager = await screen.findByRole("navigation", { name: ADMIN_TEXT.pageOf(1, 2) });
    expect(within(pager).getByRole("link")).toHaveAttribute("href", "/admin?page=2");
  });
});
