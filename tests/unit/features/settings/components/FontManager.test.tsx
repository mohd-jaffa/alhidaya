import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { DEFAULT_TYPOGRAPHY, FONT_IDS } from "@/constants/typography";
import { FontManager } from "@/features/settings/components/FontManager";
import type { TypographyDraftItem } from "@/features/settings/types";
import type { TypographyPayload } from "@/lib/validation/schemas/typography";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const START: TypographyDraftItem = { draft: DEFAULT_TYPOGRAPHY, publishedAt: PUBLISHED, unpublishedChanges: false };

function api(write: (method: string, url: string) => Answer | undefined = () => undefined) {
  let current = START;
  return stubApi((method, url, body) => {
    const answer = write(method, url);
    if (answer) return answer;
    if (url === ADMIN_API_ROUTES.adminServices) return { data: { items: [], order: {} } };
    if (method === "PUT") current = { ...current, draft: body as TypographyPayload, unpublishedChanges: true };
    if (url === ADMIN_API_ROUTES.adminTypographyPublish) current = { ...current, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminTypographyDiscard) current = START;
    return { data: current };
  });
}

const writes = (fetch: ReturnType<typeof stubApi>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method && init.method !== "GET")
    .map(([url, init]) => [init!.method, url]);

describe("FontManager (D94)", () => {
  it("opens the site's content in groups, with no list to go back to, previewing the home page", async () => {
    api();
    render(<FontManager />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("heading", { level: 1, name: ADMIN_TEXT.fontManager })).toBeVisible();
    expect(screen.getAllByRole("combobox")).toHaveLength(20);
    for (const choice of screen.getAllByRole("combobox")) {
      expect(choice).toHaveValue("inter-tight");
      expect(within(choice).getAllByRole("option")).toHaveLength(FONT_IDS.length);
    }
    expect(screen.getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(ROUTES.home)}`,
    );
  });

  it("saves, publishes and discards the site's content", async () => {
    const fetch = api();
    render(<FontManager />, { wrapper: WithSWR });
    const name = await screen.findByRole("combobox", { name: ADMIN_TEXT.fontRoleLabels.h1 });
    await userEvent.selectOptions(name, "manrope");
    expect(screen.getByLabelText(ADMIN_TEXT.fontSample(ADMIN_TEXT.fontRoleLabels.h1))).toHaveStyle({
      fontFamily: "var(--font-manrope), Arial, sans-serif",
    });
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished(ADMIN_TEXT.fontManager))).toBeVisible();
    await userEvent.selectOptions(name, "roboto");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    await userEvent.click(await screen.findByRole("button", { name: ADMIN_TEXT.discardDraft }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.discard }));
    await waitFor(() => expect(name).toHaveValue("inter-tight"));
    expect(writes(fetch)).toEqual([
      ["PUT", ADMIN_API_ROUTES.adminTypography],
      ["POST", ADMIN_API_ROUTES.adminTypographyPublish],
      ["PUT", ADMIN_API_ROUTES.adminTypography],
      ["POST", ADMIN_API_ROUTES.adminTypographyDiscard],
    ]);
  });

  it("says when the site's content did not load, with Try again", async () => {
    let fails = true;
    api((method, url) =>
      url === ADMIN_API_ROUTES.adminTypography && fails
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
        : undefined,
    );
    render(<FontManager />, { wrapper: WithSWR });
    expect(await screen.findByText(ERROR_MESSAGES.RECORD_NOT_FOUND)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("heading", { level: 1, name: ADMIN_TEXT.fontManager })).toBeVisible();
  });
});
