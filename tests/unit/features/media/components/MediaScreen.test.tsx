import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES } from "@/constants/messages";
import { MediaScreen } from "@/features/media/components/MediaScreen";
import type { LibraryImageItem } from "@/features/media/types";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const image = (id: string, alt: string, overrides: Partial<LibraryImageItem> = {}): LibraryImageItem => ({
  id,
  width: 1600,
  height: 1067,
  alt,
  decorative: alt === "",
  sources: [{ url: `/media/2026-10/${id}-w640.webp`, width: 640, mime: "image/webp" }],
  source: null,
  bytes: 240_000,
  createdAt: "2026-10-30T08:00:00.000Z",
  usedIn: [],
  ...overrides,
});

const LIBRARY = [
  image("m1", "A nurse checking a woman's blood pressure", {
    usedIn: [{ label: "Pages · Home", href: ADMIN_ROUTES.page("HOME") }],
    source: { provider: "Unsplash", url: null, licence: null },
  }),
  image("m2", ""),
];

function api(
  start: LibraryImageItem[],
  write: (method: string, url: string, body: unknown) => Answer | undefined = () => undefined,
) {
  let library = start;
  return stubApi((method, url, body) => {
    const answer = write(method, url, body);
    if (answer) return answer;
    if (method === "DELETE") library = library.filter((item) => !url.endsWith(item.id));
    if (method === "PATCH") {
      const words = body as { alt: string; decorative: boolean };
      library = library.map((item) =>
        url.endsWith(item.id) ? { ...item, alt: words.decorative ? "" : words.alt } : item,
      );
      return { data: library.find((item) => url.endsWith(item.id)) };
    }
    if (method === "POST") {
      library = [image("m3", "A new one"), ...library];
      return { data: library[0] };
    }
    return { data: library };
  });
}

const tile = (name: RegExp) => screen.getByRole("button", { name });

describe("MediaScreen (plan §15, D93)", () => {
  it("shows each image with what it shows and where it is used, found by a search", async () => {
    api(LIBRARY);
    render(<MediaScreen />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("button", { name: /A nurse checking/ })).toHaveTextContent(ADMIN_TEXT.usedCount(1));
    expect(tile(new RegExp(ADMIN_TEXT.decorativeImage))).toHaveTextContent(ADMIN_TEXT.usedCount(0));
    const search = screen.getByRole("searchbox", { name: ADMIN_TEXT.searchImages });
    await userEvent.type(search, "unsplash");
    expect(screen.queryByRole("button", { name: new RegExp(ADMIN_TEXT.decorativeImage) })).toBeNull();
    await userEvent.clear(search);
    await userEvent.type(search, "a wedding");
    expect(screen.getByText(ADMIN_TEXT.noMatches)).toBeVisible();
  });

  it("opens an image to change its words, says where it is used, and keeps Delete until nothing uses it", async () => {
    const fetch = api(LIBRARY);
    render(<MediaScreen />, { wrapper: WithSWR });
    await userEvent.click(await screen.findByRole("button", { name: /A nurse checking/ }));
    const dialog = screen.getByRole("dialog", { name: "A nurse checking a woman's blood pressure" });
    expect(within(dialog).getByText(ADMIN_TEXT.imageSize(1600, 1067))).toBeVisible();
    expect(within(dialog).getByRole("link", { name: "Pages · Home" })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.page("HOME"),
    );
    expect(within(dialog).getByText(ADMIN_TEXT.inUseNote)).toBeVisible();
    expect(within(dialog).queryByRole("button", { name: ADMIN_TEXT.delete })).toBeNull();
    const alt = within(dialog).getByRole("textbox", { name: ADMIN_TEXT.altText });
    await userEvent.clear(alt);
    await userEvent.type(alt, "A nurse and a patient");
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.saveDetails }));
    expect(await within(dialog).findByText(ADMIN_TEXT.detailsSaved)).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminMediaItem("m1"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("deletes an image nothing uses, asked first", async () => {
    api(LIBRARY);
    render(<MediaScreen />, { wrapper: WithSWR });
    await userEvent.click(await screen.findByRole("button", { name: new RegExp(ADMIN_TEXT.decorativeImage) }));
    const details = screen.getByRole("dialog", { name: ADMIN_TEXT.imageDetails });
    expect(within(details).getByText(ADMIN_TEXT.notUsed)).toBeVisible();
    await userEvent.click(within(details).getByRole("button", { name: ADMIN_TEXT.delete }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: ADMIN_TEXT.deleteImageTitle })).getByRole("button", {
        name: ADMIN_TEXT.delete,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: new RegExp(ADMIN_TEXT.decorativeImage) })).toBeNull(),
    );
  });

  it("says when an image's words were not saved", async () => {
    api(LIBRARY, (method) =>
      method === "PATCH"
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
        : undefined,
    );
    render(<MediaScreen />, { wrapper: WithSWR });
    await userEvent.click(await screen.findByRole("button", { name: /A nurse checking/ }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDetails }));
    expect(await screen.findByText(ERROR_MESSAGES.RECORD_NOT_FOUND)).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.notSaved)).toBeVisible();
  });

  it("uploads an image from its dialog, and says so", async () => {
    api(LIBRARY);
    render(<MediaScreen />, { wrapper: WithSWR });
    await screen.findByRole("button", { name: /A nurse checking/ });
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.uploadImage }));
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.uploadImage });
    await userEvent.upload(
      within(dialog).getByLabelText(ADMIN_TEXT.imageFile),
      new File(["x"], "a.jpg", { type: "image/jpeg" }),
    );
    await userEvent.type(within(dialog).getByRole("textbox", { name: ADMIN_TEXT.altText }), "A new one");
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.upload }));
    expect(await screen.findByText(ADMIN_TEXT.uploaded)).toBeVisible();
    expect(await screen.findByRole("button", { name: /A new one/ })).toBeVisible();
  });

  it("says when the library is empty, or did not load, with Try again", async () => {
    let fails = true;
    api([], () =>
      fails ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } } : undefined,
    );
    render(<MediaScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText(ADMIN_TEXT.noImages)).toBeVisible();
  });
});
