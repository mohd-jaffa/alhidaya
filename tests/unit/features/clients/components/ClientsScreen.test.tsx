import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { ClientsScreen } from "@/features/clients/components/ClientsScreen";
import type { ClientListItems, ClientSummaryItem } from "@/features/clients/types";
import { stubApi, stubDialogs, WithSWR } from "@tests/support/api";

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const LOGO = {
  id: "m1",
  width: 480,
  height: 240,
  alt: "Doha Hospital's logo",
  sources: [{ url: "/media/2026-10/logo-w480.webp", width: 480, mime: "image/webp" }],
};
const client = (id: string, name: string, overrides: Partial<ClientSummaryItem> = {}): ClientSummaryItem => ({
  id,
  name,
  url: null,
  logo: LOGO,
  publishedAt: PUBLISHED,
  archivedAt: null,
  unpublishedChanges: false,
  ...overrides,
});

const LIST: ClientListItems = {
  items: [
    client("c1", "Doha Hospital", { url: "https://hospital.example" }),
    client("c2", "A clinic", { logo: null, publishedAt: null, unpublishedChanges: true }),
    client("c3", "", { archivedAt: PUBLISHED }),
  ],
  order: { publishedAt: PUBLISHED, unpublishedChanges: false },
};

describe("ClientsScreen (D92)", () => {
  it("lists the logos in their order, each with its site, opening its editor, and moves one", async () => {
    const fetch = stubApi((method, url, body) =>
      method === "PUT"
        ? {
            data: {
              items: (body as string[]).map((id) => LIST.items.find((item) => item.id === id)),
              order: { ...LIST.order, unpublishedChanges: true },
            },
          }
        : { data: LIST },
    );
    render(<ClientsScreen />, { wrapper: WithSWR });
    const hospital = await screen.findByRole("link", { name: /Doha Hospital/ });
    expect(hospital).toHaveAttribute("href", ADMIN_ROUTES.client("c1"));
    expect(hospital).toHaveTextContent("https://hospital.example");
    expect(hospital.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.getByRole("link", { name: ADMIN_TEXT.newClient })).toHaveAttribute("href", ADMIN_ROUTES.newClient);
    expect(screen.getByRole("link", { name: new RegExp(ADMIN_TEXT.unnamed) })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.client("c3"),
    );
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, "A clinic") }));
    await waitFor(() => expect(screen.getByRole("region", { name: ADMIN_TEXT.order })).toBeVisible());
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminClientOrder,
      expect.objectContaining({ body: JSON.stringify(["c2", "c1"]) }),
    );
    expect(within(screen.getAllByRole("list")[0]).getAllByRole("link")[0]).toHaveTextContent("A clinic");
  });

  it("says when there are no logos yet, or they did not load, with Try again", async () => {
    let fails = true;
    stubApi(() =>
      fails
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : { data: { items: [], order: { publishedAt: null, unpublishedChanges: false } } },
    );
    render(<ClientsScreen />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText(ADMIN_TEXT.noClients)).toBeVisible();
  });
});
