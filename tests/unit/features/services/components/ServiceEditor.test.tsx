import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { ServiceEditor } from "@/features/services/components/ServiceEditor";
import type { ServiceDraftItem } from "@/features/services/types";
import type { ServiceDocument } from "@/lib/validation";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";
import { serviceFixture } from "@tests/support/fixtures/content";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const saved = (overrides: Partial<ServiceDraftItem> = {}): ServiceDraftItem => ({
  id: "s1",
  draft: serviceFixture({ name: { en: "Elderly care" }, slug: "elderly-care" }),
  publishedAt: PUBLISHED,
  archivedAt: null,
  unpublishedChanges: false,
  ...overrides,
});

/** The service's endpoints: its draft as last written, and what each write answers. */
function api(
  start: ServiceDraftItem | null,
  write: (method: string, url: string, body: unknown) => Answer | undefined = () => undefined,
) {
  let current = start ?? saved({ publishedAt: null, unpublishedChanges: true });
  return stubApi((method, url, body) => {
    const answer = write(method, url, body);
    if (answer) return answer;
    if (url === ADMIN_API_ROUTES.adminMedia) return { data: [] };
    if (url === ADMIN_API_ROUTES.adminServices && method === "GET") return { data: { items: [], order: {} } };
    if (method === "POST" && url === ADMIN_API_ROUTES.adminServices)
      current = { ...current, draft: body as ServiceDocument };
    if (method === "PUT") current = { ...current, draft: body as ServiceDocument, unpublishedChanges: true };
    if (url === ADMIN_API_ROUTES.adminServicePublish("s1"))
      current = { ...current, publishedAt: PUBLISHED, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminServiceDiscard("s1")) current = { ...start!, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminServiceArchive("s1"))
      current = { ...current, archivedAt: (body as { archived: boolean }).archived ? PUBLISHED : null };
    return { data: current };
  });
}

const writes = (fetch: ReturnType<typeof stubApi>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method && init.method !== "GET")
    .map(([url, init]) => [init!.method, url]);
const textbox = (name: string | RegExp) => screen.getByRole("textbox", { name });

describe("ServiceEditor (D92)", () => {
  it("starts a new service blank, fills its address from the name, and makes it on the first save", async () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const fetch = api(null);
    render(<ServiceEditor id={null} />, { wrapper: WithSWR });
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.newService })).toBeVisible();
    expect(screen.queryByRole("link", { name: ADMIN_TEXT.preview })).toBeNull();
    expect(screen.queryByRole("region", { name: ADMIN_TEXT.onTheSite })).toBeNull();
    await userEvent.type(textbox(ADMIN_TEXT.serviceName), "Elderly care");
    expect(textbox(ADMIN_TEXT.webAddress)).toHaveValue("elderly-care");
    await userEvent.type(textbox(ADMIN_TEXT.summary), "Nurses for older people at home.");
    await userEvent.type(textbox("Paragraph 1"), "Care at home.");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByRole("heading", { level: 1, name: "Elderly care" })).toBeVisible();
    expect(writes(fetch)).toEqual([["POST", ADMIN_API_ROUTES.adminServices]]);
    expect(replace).toHaveBeenCalledWith(null, "", ADMIN_ROUTES.service("s1"));
    expect(screen.getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.service("elderly-care"))}`,
    );
  });

  it("makes and publishes a new service in one go when Publish comes first", async () => {
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    const fetch = api(null);
    render(<ServiceEditor id={null} />, { wrapper: WithSWR });
    await userEvent.type(textbox(ADMIN_TEXT.serviceName), "Elderly care");
    await userEvent.type(textbox(ADMIN_TEXT.summary), "Nurses for older people at home.");
    await userEvent.type(textbox("Paragraph 1"), "Care at home.");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: ADMIN_TEXT.audience }),
      ADMIN_TEXT.audienceNames.INSTITUTIONS,
    );
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished("Elderly care"))).toBeVisible();
    expect(writes(fetch)).toEqual([
      ["POST", ADMIN_API_ROUTES.adminServices],
      ["POST", ADMIN_API_ROUTES.adminServicePublish("s1")],
    ]);
    expect(JSON.parse(String(fetch.mock.calls.find(([, init]) => init?.method === "POST")![1]!.body))).toMatchObject({
      audience: "INSTITUTIONS",
    });
  });

  it("edits a saved service, saves and discards it, and archives and restores it, each asked first", async () => {
    const fetch = api(saved());
    render(<ServiceEditor id="s1" />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    await screen.findByRole("heading", { level: 1, name: "Elderly care" });
    await userEvent.type(textbox(ADMIN_TEXT.serviceName), " at home");
    expect(textbox(ADMIN_TEXT.webAddress)).toHaveValue("elderly-care");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.discardDraft }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.discard }));
    await waitFor(() => expect(textbox(ADMIN_TEXT.serviceName)).toHaveValue("Elderly care"));

    const site = screen.getByRole("region", { name: ADMIN_TEXT.onTheSite });
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.archive }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: ADMIN_TEXT.archiveTitle("Elderly care") })).getByRole("button", {
        name: ADMIN_TEXT.archive,
      }),
    );
    expect(await within(site).findByText(ADMIN_TEXT.isArchived)).toBeVisible();
    await userEvent.click(within(site).getByRole("button", { name: ADMIN_TEXT.restore }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: ADMIN_TEXT.restoreTitle("Elderly care") })).getByRole("button", {
        name: ADMIN_TEXT.restore,
      }),
    );
    await waitFor(() => expect(within(site).queryByText(ADMIN_TEXT.isArchived)).toBeNull());
    expect(writes(fetch)).toEqual([
      ["PUT", ADMIN_API_ROUTES.adminService("s1")],
      ["POST", ADMIN_API_ROUTES.adminServiceDiscard("s1")],
      ["POST", ADMIN_API_ROUTES.adminServiceArchive("s1")],
      ["POST", ADMIN_API_ROUTES.adminServiceArchive("s1")],
    ]);
  });

  it("marks the address where another service already has it", async () => {
    api(saved(), (method) =>
      method === "POST"
        ? {
            status: 409,
            error: {
              code: "SLUG_TAKEN",
              message: ERROR_MESSAGES.SLUG_TAKEN,
              details: [{ path: "slug", message: ERROR_MESSAGES.SLUG_TAKEN }],
            } as never,
          }
        : undefined,
    );
    render(<ServiceEditor id="s1" />, { wrapper: WithSWR });
    await screen.findByRole("heading", { level: 1, name: "Elderly care" });
    await userEvent.type(textbox(ADMIN_TEXT.summary), " More.");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.publish }));
    await waitFor(() =>
      expect(textbox(ADMIN_TEXT.webAddress)).toHaveAccessibleDescription(
        expect.stringContaining(ERROR_MESSAGES.SLUG_TAKEN),
      ),
    );
  });

  it("says when the service did not load, with Try again", async () => {
    let fails = true;
    api(saved(), (method, url) =>
      url === ADMIN_API_ROUTES.adminService("s1") && fails
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
        : undefined,
    );
    render(<ServiceEditor id="s1" />, { wrapper: WithSWR });
    expect(await screen.findByText(ERROR_MESSAGES.RECORD_NOT_FOUND)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("heading", { level: 1, name: "Elderly care" })).toBeVisible();
  });
});
