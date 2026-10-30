import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { ServicesScreen } from "@/features/services/components/ServicesScreen";
import type { ServiceListItems, ServiceSummaryItem } from "@/features/services/types";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const service = (id: string, name: string, overrides: Partial<ServiceSummaryItem> = {}): ServiceSummaryItem => ({
  id,
  name,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  audience: "FAMILIES",
  publishedAt: PUBLISHED,
  archivedAt: null,
  unpublishedChanges: false,
  ...overrides,
});

const LIST: ServiceListItems = {
  items: [
    service("s1", "Elderly care"),
    service("s2", "School nurse staffing", { audience: "INSTITUTIONS", unpublishedChanges: true }),
    service("s3", "Child care", { publishedAt: null, unpublishedChanges: true }),
    service("s4", "Old care", { archivedAt: PUBLISHED }),
  ],
  order: { publishedAt: PUBLISHED, unpublishedChanges: false },
};

/** The services' endpoints: the list as it stands, the order as each write leaves it. */
function api(
  start: ServiceListItems,
  write: (method: string, url: string, body: unknown) => Answer | undefined = () => undefined,
) {
  let current = start;
  return stubApi((method, url, body) => {
    const answer = write(method, url, body);
    if (answer) return answer;
    if (url === ADMIN_API_ROUTES.adminServiceOrder) {
      const ids = body as string[];
      current = {
        items: [
          ...ids.map((id) => current.items.find((item) => item.id === id)!),
          ...current.items.filter((item) => item.archivedAt),
        ],
        order: { ...current.order, unpublishedChanges: true },
      };
    }
    if (url === ADMIN_API_ROUTES.adminServiceOrderPublish)
      current = { ...current, order: { publishedAt: PUBLISHED, unpublishedChanges: false } };
    if (url === ADMIN_API_ROUTES.adminServiceOrderDiscard) current = start;
    return { data: current };
  });
}

const names = () =>
  within(screen.getAllByRole("list")[0])
    .getAllByRole("link")
    .map((link) => link.querySelector("span")!.textContent);

describe("ServicesScreen (D92)", () => {
  it("waits while the services are read, and says when they did not load, with Try again", async () => {
    let fails = true;
    api(LIST, () =>
      fails ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } } : undefined,
    );
    render(<ServicesScreen />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("link", { name: /Elderly care/ })).toBeVisible();
  });

  it("lists the services in their order, each opening its editor, the archived folded below", async () => {
    api(LIST);
    render(<ServicesScreen />, { wrapper: WithSWR });
    const elderly = await screen.findByRole("link", { name: /Elderly care/ });
    expect(elderly).toHaveAttribute("href", ADMIN_ROUTES.service("s1"));
    expect(elderly).toHaveTextContent(`${ADMIN_TEXT.audienceNames.FAMILIES} · ${ROUTES.service("elderly-care")}`);
    expect(names()).toEqual(["Elderly care", "School nurse staffing", "Child care"]);
    expect(screen.getByRole("link", { name: ADMIN_TEXT.newService })).toHaveAttribute("href", ADMIN_ROUTES.newService);
    const archived = screen.getByText(ADMIN_TEXT.archivedCount(1)).closest("details")!;
    expect(within(archived).getByRole("link", { name: /Old care/ })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.service("s4"),
    );
    expect(screen.queryByRole("region", { name: ADMIN_TEXT.order })).toBeNull();
  });

  it("saves a move as the order's draft at once, says it aloud, and asks before publishing it", async () => {
    const fetch = api(LIST);
    render(<ServicesScreen />, { wrapper: WithSWR });
    await screen.findByRole("link", { name: /Elderly care/ });
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Elderly care") }),
    );
    await waitFor(() => expect(names()).toEqual(["School nurse staffing", "Elderly care", "Child care"]));
    expect(screen.getByText(ADMIN_TEXT.movedTo("Elderly care", 2, 3))).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminServiceOrder,
      expect.objectContaining({ method: "PUT", body: JSON.stringify(["s2", "s1", "s3"]) }),
    );
    const order = await screen.findByRole("region", { name: ADMIN_TEXT.order });
    expect(within(order).getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.services)}`,
    );
    await userEvent.click(within(order).getByRole("button", { name: ADMIN_TEXT.publishOrder }));
    const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.publishOrderTitle });
    await userEvent.click(within(asked).getByRole("button", { name: ADMIN_TEXT.publishOrder }));
    expect(await screen.findByText(ADMIN_TEXT.orderPublished)).toBeVisible();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.seeOnSite })).toHaveAttribute("href", ROUTES.services);
    expect(screen.queryByRole("region", { name: ADMIN_TEXT.order })).toBeNull();
  });

  it("moves a service dragged by its handle, and discards a new order, asked first", async () => {
    const fetch = api(LIST);
    render(<ServicesScreen />, { wrapper: WithSWR });
    await screen.findByRole("link", { name: /Elderly care/ });
    const rows = () => screen.getAllByRole("listitem").slice(0, 3);
    const transfer = { effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() };
    fireEvent.dragStart(rows()[2].querySelector("[draggable]")!, { dataTransfer: transfer });
    fireEvent.dragOver(rows()[0]);
    fireEvent.drop(rows()[0]);
    await waitFor(() => expect(names()).toEqual(["Child care", "Elderly care", "School nurse staffing"]));
    const order = await screen.findByRole("region", { name: ADMIN_TEXT.order });
    await userEvent.click(within(order).getByRole("button", { name: ADMIN_TEXT.discardOrder }));
    const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.discardOrderTitle });
    await userEvent.click(within(asked).getByRole("button", { name: ADMIN_TEXT.discardOrder }));
    await waitFor(() => expect(names()).toEqual(["Elderly care", "School nurse staffing", "Child care"]));
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminServiceOrderDiscard,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("puts a move back and says so when it was not saved; offers no Discard for an order never published", async () => {
    api({ items: LIST.items.slice(0, 3), order: { publishedAt: null, unpublishedChanges: true } }, (method) =>
      method === "PUT"
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : undefined,
    );
    render(<ServicesScreen />, { wrapper: WithSWR });
    const order = await screen.findByRole("region", { name: ADMIN_TEXT.order });
    expect(within(order).queryByRole("button", { name: ADMIN_TEXT.discardOrder })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, "Child care") }));
    expect(await screen.findByText(ADMIN_TEXT.orderNotSaved)).toBeVisible();
    expect(names()).toEqual(["Elderly care", "School nurse staffing", "Child care"]);
    expect(screen.queryByText(ADMIN_TEXT.archivedCount(0))).toBeNull();
  });

  it("names a service with no name yet, in the order and in the archived", async () => {
    api({ items: [service("s8", ""), service("s9", "", { archivedAt: PUBLISHED })], order: LIST.order });
    render(<ServicesScreen />, { wrapper: WithSWR });
    expect(
      await screen.findByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, ADMIN_TEXT.unnamed) }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("says when there are no services yet, and names one with no name", async () => {
    api({
      items: [service("s9", "", { archivedAt: PUBLISHED })],
      order: { publishedAt: null, unpublishedChanges: false },
    });
    render(<ServicesScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.noServices)).toBeVisible();
    expect(screen.getByRole("link", { name: new RegExp(ADMIN_TEXT.unnamed) })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.service("s9"),
    );
  });
});
