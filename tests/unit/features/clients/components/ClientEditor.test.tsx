import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { ClientEditor } from "@/features/clients/components/ClientEditor";
import type { ClientDraftItem } from "@/features/clients/types";
import type { ClientDocument } from "@/lib/validation";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const LOGO = "11111111-1111-4111-8111-111111111111";
const LIBRARY = [
  {
    id: LOGO,
    width: 480,
    height: 240,
    alt: "Doha Hospital's logo",
    decorative: false,
    sources: [{ url: "/media/2026-10/logo-w480.webp", width: 480, mime: "image/webp" }],
    source: null,
    bytes: 1000,
    createdAt: PUBLISHED,
    usedIn: [],
  },
];
const saved = (overrides: Partial<ClientDraftItem> = {}): ClientDraftItem => ({
  id: "c1",
  draft: { name: { en: "Doha Hospital" }, logo: { mediaId: LOGO }, url: null },
  publishedAt: PUBLISHED,
  archivedAt: null,
  unpublishedChanges: false,
  ...overrides,
});

function api(
  start: ClientDraftItem | null,
  write: (method: string, url: string, body: unknown) => Answer | undefined = () => undefined,
) {
  let current = start ?? saved({ publishedAt: null, unpublishedChanges: true });
  return stubApi((method, url, body) => {
    const answer = write(method, url, body);
    if (answer) return answer;
    if (url === ADMIN_API_ROUTES.adminMedia) return { data: LIBRARY };
    if (url === ADMIN_API_ROUTES.adminClients && method === "GET") return { data: { items: [], order: {} } };
    if (method === "POST" && url === ADMIN_API_ROUTES.adminClients)
      current = { ...current, draft: body as ClientDocument };
    if (method === "PUT") current = { ...current, draft: body as ClientDocument, unpublishedChanges: true };
    if (url === ADMIN_API_ROUTES.adminClientPublish("c1"))
      current = { ...current, publishedAt: PUBLISHED, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminClientDiscard("c1")) current = { ...start!, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminClientArchive("c1"))
      current = { ...current, archivedAt: (body as { archived: boolean }).archived ? PUBLISHED : null };
    return { data: current };
  });
}

const writes = (fetch: ReturnType<typeof stubApi>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method && init.method !== "GET")
    .map(([url, init]) => [init!.method, url]);

describe("ClientEditor (D92)", () => {
  it("adds a logo: refused without its logo, made on its first save once one is chosen from the library", async () => {
    const replace = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    const fetch = api(null);
    render(<ClientEditor id={null} />, { wrapper: WithSWR });
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.newClient })).toBeVisible();
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.organisation }), "Doha Hospital");
    await userEvent.type(
      screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.website) }),
      "https://hospital.example",
    );
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText(VALIDATION_MESSAGES.required("The logo"))).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.noLogo)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.chooseLogo }));
    await userEvent.click(await screen.findByRole("button", { name: "Doha Hospital's logo" }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByRole("heading", { level: 1, name: "Doha Hospital" })).toBeVisible();
    expect(writes(fetch)).toEqual([["POST", ADMIN_API_ROUTES.adminClients]]);
    expect(JSON.parse(String(fetch.mock.calls.find(([, init]) => init?.method === "POST")![1]!.body))).toEqual({
      name: { en: "Doha Hospital" },
      logo: { mediaId: LOGO },
      url: "https://hospital.example",
    });
    expect(replace).toHaveBeenCalledWith(null, "", ADMIN_ROUTES.client("c1"));
    expect(screen.getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.home)}`,
    );
  });

  it("saves, discards and publishes a saved logo, and archives and restores it", async () => {
    const fetch = api(saved());
    render(<ClientEditor id="c1" />, { wrapper: WithSWR });
    await screen.findByRole("heading", { level: 1, name: "Doha Hospital" });
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.organisation }), " Group");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    await userEvent.click(await screen.findByRole("button", { name: ADMIN_TEXT.discardDraft }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.discard }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: ADMIN_TEXT.organisation })).toHaveValue("Doha Hospital"),
    );
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.organisation }), "!");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished("Doha Hospital!"))).toBeVisible();

    const site = screen.getByRole("region", { name: ADMIN_TEXT.onTheSite });
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.archive }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.archive }));
    expect(await within(site).findByText(ADMIN_TEXT.isArchived)).toBeVisible();
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.restore }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.restore }));
    await waitFor(() => expect(within(site).queryByText(ADMIN_TEXT.isArchived)).toBeNull());
    expect(writes(fetch)).toEqual([
      ["PUT", ADMIN_API_ROUTES.adminClient("c1")],
      ["POST", ADMIN_API_ROUTES.adminClientDiscard("c1")],
      ["PUT", ADMIN_API_ROUTES.adminClient("c1")],
      ["POST", ADMIN_API_ROUTES.adminClientPublish("c1")],
      ["POST", ADMIN_API_ROUTES.adminClientArchive("c1")],
      ["POST", ADMIN_API_ROUTES.adminClientArchive("c1")],
    ]);
  });

  it("says when the logo did not load, with Try again", async () => {
    let fails = true;
    api(
      saved({ draft: { name: { en: "Doha Hospital" }, logo: { mediaId: LOGO }, url: "https://hospital.example" } }),
      (method, url) =>
        url === ADMIN_API_ROUTES.adminClient("c1") && fails
          ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
          : undefined,
    );
    render(<ClientEditor id="c1" />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText(ERROR_MESSAGES.RECORD_NOT_FOUND)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("textbox", { name: new RegExp(ADMIN_TEXT.website) })).toHaveValue(
      "https://hospital.example",
    );
  });
});
