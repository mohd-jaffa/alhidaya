import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { PAGE_ROUTES, API_ROUTES } from "@/constants/routes";
import { PageEditor } from "@/features/content/components/PageEditor";
import type { PageDraftItem } from "@/features/content/types";
import type { PageDocument } from "@/lib/validation";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";
import { pageFixture } from "@tests/support/fixtures/content";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const PUBLISHED = "2026-10-29T08:00:00.000Z";
const draftOf = (document: PageDocument, overrides: Partial<PageDraftItem> = {}): PageDraftItem => ({
  page: "HOME",
  draft: document,
  publishedAt: PUBLISHED,
  unpublishedChanges: false,
  ...overrides,
});

/** The page's endpoints: its draft as last saved, and what each write answers. */
function api(
  start: PageDraftItem,
  write: (method: string, url: string, body: unknown) => Answer | undefined = () => undefined,
) {
  let current = start;
  const fetch = stubApi((method, url, body) => {
    const answer = write(method, url, body);
    if (answer) return answer;
    if (method === "PUT") current = { ...current, draft: body as PageDocument, unpublishedChanges: true };
    if (url === ADMIN_API_ROUTES.adminPagePublish("HOME"))
      return {
        data: {
          publishedAt: (current = { ...current, unpublishedChanges: false, publishedAt: PUBLISHED }).publishedAt,
        },
      };
    if (url === ADMIN_API_ROUTES.adminPageDiscard("HOME"))
      current = { ...current, draft: start.draft, unpublishedChanges: false };
    if (url === ADMIN_API_ROUTES.adminMedia) return { data: [] };
    if (url === ADMIN_API_ROUTES.adminPages) return { data: [] };
    return { data: current };
  });
  return fetch;
}

const show = () => render(<PageEditor page="HOME" />, { wrapper: WithSWR });
const editor = async () => {
  show();
  await screen.findByRole("heading", { level: 1, name: "Home" });
};
const bar = () => screen.getByRole("heading", { level: 1, name: "Home" }).closest("form")!;
const openIntro = () => userEvent.click(screen.getAllByRole("button", { expanded: false })[1]);
const writes = (fetch: ReturnType<typeof stubApi>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method && init.method !== "GET")
    .map(([url, init]) => [init!.method, url]);

describe("PageEditor", () => {
  it("waits while the page is read, and says when it did not load, with Try again", async () => {
    let fails = true;
    api(draftOf(pageFixture("HOME")), (method, url) =>
      url === ADMIN_API_ROUTES.adminPage("HOME") && fails
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : undefined,
    );
    show();
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeVisible();
  });

  it("opens with the page's state, its sections, its search words and a preview of what is saved (D88)", async () => {
    api(draftOf(pageFixture("HOME")));
    await editor();
    expect(await within(bar()).findByText(ADMIN_TEXT.published)).toBeVisible();
    expect(within(bar()).getByRole("link", { name: ADMIN_TEXT.pages })).toBeVisible();
    expect(within(bar()).getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent(PAGE_ROUTES.HOME)}`,
    );
    expect(within(bar()).getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute("target", "_blank");
    expect(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft })).toBeDisabled();
    expect(within(bar()).getByRole("button", { name: ADMIN_TEXT.publish })).toBeDisabled();
    expect(within(bar()).queryByRole("button", { name: ADMIN_TEXT.discardDraft })).toBeNull();
    expect(screen.getByRole("heading", { name: ADMIN_TEXT.sections })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /SEO title/ })).toBeVisible();
  });

  it("saves the draft whole, then shows it saved and waiting to be published", async () => {
    const fetch = api(draftOf(pageFixture("HOME")));
    await editor();
    await openIntro();
    await userEvent.clear(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }));
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }), "  Who   we are, today ");
    expect(within(bar()).getByText(ADMIN_TEXT.unsavedChanges)).toBeVisible();
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await within(bar()).findByText(ADMIN_TEXT.changesNotPublished)).toBeVisible();
    const [, put] = fetch.mock.calls.find(([, init]) => init?.method === "PUT")!;
    expect(JSON.parse(String(put?.body)).sections[1].content.heading.en).toBe("Who we are, today");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.heading })).toHaveValue("Who we are, today");
    expect(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft })).toBeDisabled();
    expect(within(bar()).getByRole("button", { name: ADMIN_TEXT.discardDraft })).toBeEnabled();
  });

  it("refuses to save what the page's checks refuse: the field marked, its section opened and the count in view", async () => {
    const fetch = api(draftOf(pageFixture("HOME")));
    await editor();
    await openIntro();
    await userEvent.clear(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }));
    await openIntro();
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText(ADMIN_TEXT.fieldsNeedAttention(1))).toBeVisible();
    const heading = screen.getByRole("textbox", { name: ADMIN_TEXT.heading });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(heading).toHaveAttribute("aria-invalid", "true");
    expect(writes(fetch)).toEqual([]);
  });

  it("marks each field the server refuses, opening its section, and says when it was not saved", async () => {
    let refuse: Answer | undefined = {
      status: 400,
      error: { code: "VALIDATION_ERROR", message: ERROR_MESSAGES.VALIDATION_ERROR },
    };
    (refuse as { error: { details?: unknown } }).error.details = [
      { path: "sections.1.content.heading.en", message: "Heading is too long." },
    ];
    api(draftOf(pageFixture("HOME")), (method) => (method === "PUT" ? refuse : undefined));
    await editor();
    await openIntro();
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }), "!");
    await openIntro();
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText("Heading is too long.")).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.fieldsNeedAttention(1))).toBeVisible();

    refuse = { status: 422, error: { code: "IMAGE_NOT_FOUND", message: ERROR_MESSAGES.IMAGE_NOT_FOUND } };
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }), "!");
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText(ADMIN_TEXT.notSaved)).toBeVisible();
    expect(screen.getByText(ERROR_MESSAGES.IMAGE_NOT_FOUND)).toBeVisible();
  });

  it("puts a rule about the whole page at the top of what needs attention", async () => {
    const refuse = { status: 400, error: { code: "VALIDATION_ERROR", message: ERROR_MESSAGES.VALIDATION_ERROR } };
    (refuse.error as { details?: unknown }).details = [
      { path: "sections", message: "This page needs a visible “Form” section." },
    ];
    api(draftOf(pageFixture("HOME")), (method) => (method === "PUT" ? refuse : undefined));
    await editor();
    await openIntro();
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }), "!");
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText("This page needs a visible “Form” section.")).toBeVisible();
  });

  it("publishes once asked, then says so with a link to the page; Not yet leaves it", async () => {
    const fetch = api(draftOf(pageFixture("HOME"), { unpublishedChanges: true }));
    await editor();
    await within(bar()).findByText(ADMIN_TEXT.changesNotPublished);
    const publish = within(bar()).getByRole("button", { name: ADMIN_TEXT.publish });
    await userEvent.click(publish);
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.publishTitle("Home") });
    expect(within(dialog).getByText(ADMIN_TEXT.publishBody)).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.keepEditing }));
    expect(writes(fetch)).toEqual([]);

    await userEvent.click(publish);
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished("Home"))).toBeVisible();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.seeOnSite })).toHaveAttribute("href", PAGE_ROUTES.HOME);
    expect(writes(fetch)).toEqual([["POST", ADMIN_API_ROUTES.adminPagePublish("HOME")]]);
    await waitFor(() => expect(within(bar()).getByText(ADMIN_TEXT.published)).toBeVisible());
  });

  it("saves unsaved changes first when publishing, and stops if they are not saved", async () => {
    let failSave = true;
    const fetch = api(draftOf(pageFixture("HOME")), (method) =>
      method === "PUT" && failSave
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : undefined,
    );
    await editor();
    await openIntro();
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.heading }), "!");
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.publish }));
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.publishTitle("Home") });
    expect(within(dialog).getByText(ADMIN_TEXT.publishBodyUnsaved)).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.notSaved)).toBeVisible();
    expect(writes(fetch)).toEqual([["PUT", ADMIN_API_ROUTES.adminPage("HOME")]]);

    failSave = false;
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.isPublished("Home"))).toBeVisible();
    expect(writes(fetch).slice(1)).toEqual([
      ["PUT", ADMIN_API_ROUTES.adminPage("HOME")],
      ["POST", ADMIN_API_ROUTES.adminPagePublish("HOME")],
    ]);
  });

  it("says when a publish failed, keeping what is saved", async () => {
    api(draftOf(pageFixture("HOME"), { unpublishedChanges: true }), (_, url) =>
      url === ADMIN_API_ROUTES.adminPagePublish("HOME")
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : undefined,
    );
    await editor();
    await userEvent.click(await within(bar()).findByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: ADMIN_TEXT.publishTitle("Home") })).getByRole("button", {
        name: ADMIN_TEXT.publish,
      }),
    );
    expect(await within(bar()).findByText(ADMIN_TEXT.publishFailed)).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.notPublished)).toBeVisible();
  });

  it("discards the draft once asked, back to what is published, and says when it could not", async () => {
    const published = pageFixture("HOME");
    let fails = true;
    const fetch = api(draftOf(published, { unpublishedChanges: true }), (_, url) =>
      url === ADMIN_API_ROUTES.adminPageDiscard("HOME") && fails
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : undefined,
    );
    await editor();
    await userEvent.click(await within(bar()).findByRole("button", { name: ADMIN_TEXT.discardDraft }));
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.discardTitle("Home") });
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.keepChanges }));
    expect(writes(fetch)).toEqual([]);

    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.discardDraft }));
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.discard }));
    expect(await within(dialog).findByText(ADMIN_TEXT.notDiscarded)).toBeVisible();
    fails = false;
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.discard }));
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(await within(bar()).findByText(ADMIN_TEXT.published)).toBeVisible();
  });

  it("refuses to publish a saved draft the checks now refuse, outside any section", async () => {
    const page = pageFixture("HOME");
    const fetch = api(
      draftOf(
        {
          ...page,
          seo: { ...page.seo, title: { en: "Home nursing care in Doha ".repeat(4) } },
        },
        {
          unpublishedChanges: true,
        },
      ),
    );
    await editor();
    await userEvent.click(within(bar()).getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText(ADMIN_TEXT.fieldsNeedAttention(1))).toBeVisible();
    await waitFor(() => expect(screen.getByRole("textbox", { name: /SEO title/ })).toHaveFocus());
    expect(writes(fetch)).toEqual([]);
  });

  it("offers Publish for a page never published, and no Discard", async () => {
    api(draftOf(pageFixture("HOME"), { publishedAt: null, unpublishedChanges: true }));
    await editor();
    expect(await within(bar()).findByText(ADMIN_TEXT.notPublishedYet)).toBeVisible();
    expect(within(bar()).getByRole("button", { name: ADMIN_TEXT.publish })).toBeEnabled();
    expect(within(bar()).queryByRole("button", { name: ADMIN_TEXT.discardDraft })).toBeNull();
  });
});
