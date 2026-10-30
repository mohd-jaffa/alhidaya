import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageUpload } from "@/components/admin/editor/ImageUpload";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const file = () => new File([new Uint8Array([0xff, 0xd8, 0xff])], "nurse.jpg", { type: "image/jpeg" });

describe("ImageUpload (plan §15, D93)", () => {
  it("asks for the image and what it shows before it sends anything", async () => {
    const fetch = stubApi(() => ({ data: {} }));
    render(<ImageUpload onUploaded={vi.fn()} />, { wrapper: WithSWR });
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.upload }));
    expect(await screen.findByText(VALIDATION_MESSAGES.required("The image"))).toBeVisible();
    expect(screen.getByText(VALIDATION_MESSAGES.required("Alt text"))).toBeVisible();
    await userEvent.upload(screen.getByLabelText(ADMIN_TEXT.imageFile), file());
    expect(screen.queryByText(VALIDATION_MESSAGES.required("The image"))).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the file beside its words, and hands on what the library kept", async () => {
    const kept = { id: "m1", alt: "" };
    const fetch = stubApi(() => ({ data: kept }));
    const onUploaded = vi.fn();
    render(<ImageUpload onUploaded={onUploaded} />, { wrapper: WithSWR });
    await userEvent.upload(screen.getByLabelText(ADMIN_TEXT.imageFile), file());
    await userEvent.click(screen.getByRole("checkbox", { name: ADMIN_TEXT.decorative }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.upload }));
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(kept));
    const [url, init] = fetch.mock.calls[0];
    expect([url, init?.method]).toEqual([ADMIN_API_ROUTES.adminMedia, "POST"]);
    const form = init?.body as FormData;
    expect(JSON.parse(String(form.get("fields")))).toEqual({
      alt: "",
      decorative: true,
      source: { provider: "", url: "", licence: "" },
    });
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("says why the server refused it, and keeps what was typed", async () => {
    stubApi(() => ({ status: 422, error: { code: "STORAGE_FULL", message: ERROR_MESSAGES.STORAGE_FULL } }));
    render(<ImageUpload onUploaded={vi.fn()} />, { wrapper: WithSWR });
    await userEvent.upload(screen.getByLabelText(ADMIN_TEXT.imageFile), file());
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.altText }), "A nurse");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.upload }));
    expect(await screen.findByText(ERROR_MESSAGES.STORAGE_FULL)).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.notUploaded)).toBeVisible();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.altText })).toHaveValue("A nurse");
  });

  it("forgets the file when the picker is emptied", async () => {
    const fetch = stubApi(() => ({ data: {} }));
    render(<ImageUpload onUploaded={vi.fn()} />, { wrapper: WithSWR });
    const picker = screen.getByLabelText(ADMIN_TEXT.imageFile);
    await userEvent.upload(picker, file());
    await userEvent.upload(picker, []);
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.altText }), "A nurse");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.upload }));
    expect(await screen.findByText(VALIDATION_MESSAGES.required("The image"))).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });
});
