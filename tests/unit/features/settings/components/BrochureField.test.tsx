import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { BrochureField } from "@/features/settings/components/BrochureField";
import { type Answer, stubApi } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

const KEPT = { id: "11111111-1111-4111-8111-111111111111", url: "/media/2026-10/abcdefghij.pdf", bytes: 2_900_000 };
const NEW = { id: "22222222-2222-4222-8222-222222222222", url: "/media/2026-10/klmnopqrst.pdf", bytes: 1_000_000 };

function brochure(value: unknown, answer: () => Answer = () => ({ data: NEW })) {
  const fetch = stubApi(answer);
  let form!: UseFormReturn<FieldValues>;
  render(
    <EditorForm values={{ brochure: value }} onForm={(methods) => (form = methods)}>
      <BrochureField known={KEPT} />
    </EditorForm>,
  );
  return { fetch, value: () => form.getValues("brochure") };
}

const pdf = () => new File(["%PDF-1.7"], "brochure.pdf", { type: "application/pdf" });

describe("BrochureField (plan §12, D94)", () => {
  it("opens the brochure the draft names, and removes it", async () => {
    const { value } = brochure({ mediaId: KEPT.id });
    expect(screen.getByRole("link", { name: ADMIN_TEXT.openBrochure })).toHaveAttribute("href", KEPT.url);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.removeBrochure }));
    expect(value()).toBeNull();
    expect(screen.getByText(ADMIN_TEXT.noBrochure)).toBeVisible();
  });

  it("uploads a new PDF, which the draft then names", async () => {
    const { value, fetch } = brochure(null);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.uploadBrochure }));
    expect(screen.getByText(VALIDATION_MESSAGES.required("The PDF"))).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
    await userEvent.upload(screen.getByLabelText(ADMIN_TEXT.brochureFile), pdf());
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.uploadBrochure }));
    await waitFor(() => expect(value()).toEqual({ mediaId: NEW.id }));
    expect(screen.getByRole("link", { name: ADMIN_TEXT.openBrochure })).toHaveAttribute("href", NEW.url);
  });

  it("says why an upload was refused", async () => {
    brochure(null, () => ({
      status: 400,
      error: { code: "UPLOAD_TYPE_NOT_ALLOWED", message: ERROR_MESSAGES.UPLOAD_TYPE_NOT_ALLOWED },
    }));
    const picker = screen.getByLabelText(ADMIN_TEXT.brochureFile);
    await userEvent.upload(picker, pdf());
    await userEvent.upload(picker, []);
    await userEvent.upload(picker, pdf());
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.uploadBrochure }));
    expect(await screen.findByText(ERROR_MESSAGES.UPLOAD_TYPE_NOT_ALLOWED)).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.brochureNotUploaded)).toBeVisible();
  });
});
