import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { SEED_SITE } from "@/db/seed/content";
import { SettingsEditor } from "@/features/settings/components/SettingsEditor";
import type { SiteDraftItem } from "@/features/settings/types";
import type { SiteDocument } from "@/lib/validation";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const START: SiteDraftItem = { draft: SEED_SITE, publishedAt: PUBLISHED, unpublishedChanges: false, brochure: null };

function api(write: (method: string, url: string) => Answer | undefined = () => undefined) {
  let current = START;
  return stubApi((method, url, body) => {
    const answer = write(method, url);
    if (answer) return answer;
    if (url === ADMIN_API_ROUTES.adminServices) return { data: { items: [], order: {} } };
    if (method === "PUT") current = { ...current, draft: body as SiteDocument, unpublishedChanges: true };
    if (url === ADMIN_API_ROUTES.adminSitePublish) current = { ...current, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminSiteDiscard) current = START;
    return { data: current };
  });
}

const writes = (fetch: ReturnType<typeof stubApi>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method && init.method !== "GET")
    .map(([url, init]) => [init!.method, url]);

describe("SettingsEditor (D94)", () => {
  it("opens the site's content in groups, with no list to go back to, previewing the home page", async () => {
    api();
    render(<SettingsEditor />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("heading", { level: 1, name: ADMIN_TEXT.settings })).toBeVisible();
    for (const group of [
      ADMIN_TEXT.company,
      ADMIN_TEXT.contactDetails,
      ADMIN_TEXT.socialLinks,
      ADMIN_TEXT.whatsappButton,
      ADMIN_TEXT.headerMenu,
      ADMIN_TEXT.footer,
      ADMIN_TEXT.seo,
      ADMIN_TEXT.brochure,
    ])
      expect(screen.getByRole("region", { name: group })).toBeVisible();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.seoTitle })).toBeRequired();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.home)}`,
    );
    expect(screen.getByRole("switch", { name: ADMIN_TEXT.whatsappButtonLabel })).toBeChecked();
    expect(screen.getByRole("textbox", { name: `${ADMIN_TEXT.addressLine} 1` })).toHaveValue(
      "Retaj Building, Bin Naifaa 80",
    );
  });

  it("saves, publishes and discards the site's content", async () => {
    const fetch = api();
    render(<SettingsEditor />, { wrapper: WithSWR });
    const name = await screen.findByRole("textbox", { name: ADMIN_TEXT.companyName });
    await userEvent.type(name, " WLL");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished(ADMIN_TEXT.settings))).toBeVisible();
    await userEvent.type(name, "!");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    await userEvent.click(await screen.findByRole("button", { name: ADMIN_TEXT.discardDraft }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.discard }));
    await waitFor(() => expect(name).toHaveValue(SEED_SITE.name.en));
    expect(writes(fetch)).toEqual([
      ["PUT", ADMIN_API_ROUTES.adminSite],
      ["POST", ADMIN_API_ROUTES.adminSitePublish],
      ["PUT", ADMIN_API_ROUTES.adminSite],
      ["POST", ADMIN_API_ROUTES.adminSiteDiscard],
    ]);
  });

  it("says when the site's content did not load, with Try again", async () => {
    let fails = true;
    api((method, url) =>
      url === ADMIN_API_ROUTES.adminSite && fails
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
        : undefined,
    );
    render(<SettingsEditor />, { wrapper: WithSWR });
    expect(await screen.findByText(ERROR_MESSAGES.RECORD_NOT_FOUND)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("heading", { level: 1, name: ADMIN_TEXT.settings })).toBeVisible();
  });
});
