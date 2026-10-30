import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UI_TEXT } from "@/constants/messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { PhotoField } from "@/components/admin/editor/PhotoField";
import type { LibraryImageItem } from "@/features/media/types";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const image = (id: string, alt: string, decorative = false): LibraryImageItem => ({
  id,
  width: 1600,
  height: 1067,
  alt,
  decorative,
  sources: [{ url: `/media/2026-10/${id}-w640.webp`, width: 640, mime: "image/webp" }],
  source: null,
  bytes: 120_000,
  createdAt: "2026-10-30T08:00:00.000Z",
  usedIn: [],
});

const LIBRARY = [
  image("11111111-1111-4111-8111-111111111111", "A nurse checking a woman's blood pressure"),
  image("22222222-2222-4222-8222-222222222222", "", true),
];

function photo(
  value: unknown,
  answer: (method: string, url: string) => Answer = () => ({ data: LIBRARY }),
  required = false,
) {
  const fetch = stubApi(answer);
  let form!: UseFormReturn<FieldValues>;
  render(
    <WithSWR>
      <EditorForm values={{ image: value }} onForm={(methods) => (form = methods)}>
        <PhotoField name="image" label={ADMIN_TEXT.photo} required={required} logo={required} />
      </EditorForm>
    </WithSWR>,
  );
  return { fetch, value: () => form.getValues("image"), form: () => form };
}

describe("PhotoField", () => {
  it("says there is no photo, and reads nothing until the library is opened", async () => {
    const { fetch } = photo(null);
    expect(screen.getByRole("group", { name: `${ADMIN_TEXT.photo} (${UI_TEXT.optional})` })).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.noPhoto)).toBeVisible();
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.removePhoto })).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("chooses a photo from the library in a dialog, the chosen one marked, and shows it with its words (D89)", async () => {
    const { value } = photo(null);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.choosePhoto }));
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.choosePhoto });
    const decorative = await within(dialog).findByRole("button", { name: ADMIN_TEXT.decorativeImage });
    expect(decorative).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(within(dialog).getByRole("button", { name: LIBRARY[0].alt }));
    expect(value()).toEqual({ mediaId: LIBRARY[0].id });
    expect(dialog).not.toHaveAttribute("open");
    expect(await screen.findByRole("img", { name: LIBRARY[0].alt })).toBeVisible();
    expect(screen.getByText(LIBRARY[0].alt, { selector: "figcaption" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.changePhoto }));
    expect(await within(dialog).findByRole("button", { name: LIBRARY[0].alt })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.decorativeImage }));
    expect(screen.getByText(ADMIN_TEXT.decorativeImage, { selector: "figcaption" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.removePhoto }));
    expect(value()).toBeNull();
    expect(screen.getByText(ADMIN_TEXT.noPhoto)).toBeVisible();
  });

  it("says when a chosen photo has left the library, and waits while the library is read", async () => {
    photo({ mediaId: "33333333-3333-4333-8333-333333333333" });
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(await screen.findByText(ADMIN_TEXT.photoMissing)).toBeVisible();
  });

  it("says when the library is empty, or did not load, with Try again", async () => {
    let fails = true;
    photo(null, (_, url) =>
      url === ADMIN_API_ROUTES.adminMedia && fails
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: "Something went wrong." } }
        : { data: [] },
    );
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.choosePhoto }));
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText(ADMIN_TEXT.libraryEmpty)).toBeVisible();
  });

  it("shows an error the form gives it", async () => {
    const { form } = photo(null);
    act(() => form().setError("image", { message: "Choose a photo from the library." }));
    await waitFor(() => expect(screen.getByText("Choose a photo from the library.")).toBeVisible());
  });

  it("uploads a new image from the picker, which is then chosen (D93)", async () => {
    const uploaded = image("33333333-3333-4333-8333-333333333333", "A nurse at the door");
    const { fetch, value } = photo(null, (method) => (method === "POST" ? { data: uploaded } : { data: LIBRARY }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.choosePhoto }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.uploadNew }));
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.uploadNew });
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.backToLibrary }));
    expect(screen.getByRole("dialog", { name: ADMIN_TEXT.choosePhoto })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.uploadNew }));
    await userEvent.upload(
      screen.getByLabelText(ADMIN_TEXT.imageFile),
      new File([new Uint8Array([0xff, 0xd8, 0xff])], "nurse.jpg", { type: "image/jpeg" }),
    );
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.altText }), "A nurse at the door");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.upload }));
    await waitFor(() => expect(value()).toEqual({ mediaId: uploaded.id }));
    expect(fetch).toHaveBeenCalledWith(ADMIN_API_ROUTES.adminMedia, expect.objectContaining({ method: "POST" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("holds a required logo: not marked optional, and never removed, only changed", async () => {
    photo({ mediaId: LIBRARY[0].id }, () => ({ data: LIBRARY }), true);
    expect(screen.getByRole("group", { name: ADMIN_TEXT.photo })).toBeVisible();
    expect(await screen.findByRole("button", { name: ADMIN_TEXT.changeLogo })).toBeVisible();
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.removePhoto })).toBeNull();
  });
});
