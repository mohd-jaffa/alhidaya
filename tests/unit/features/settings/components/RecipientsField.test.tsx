import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { RecipientsField } from "@/features/settings/components/RecipientsField";
import { DEFAULT_OPERATIONS } from "@/lib/content/operations";
import { operationsSchema } from "@/lib/validation";
import { EditorForm } from "@tests/support/editor-form";

function recipients(enquiriesTo: string[]) {
  let form!: UseFormReturn<FieldValues>;
  render(
    <EditorForm
      values={{ ...DEFAULT_OPERATIONS, enquiriesTo }}
      schema={operationsSchema}
      onForm={(methods) => (form = methods)}
    >
      <RecipientsField name="enquiriesTo" label={ADMIN_TEXT.enquiriesTo} />
    </EditorForm>,
  );
  return () => form.getValues("enquiriesTo");
}

const address = (number: number) =>
  screen.getByRole("textbox", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.recipient, number) });

describe("RecipientsField (plan §13, Q17)", () => {
  it("edits, adds and removes addresses, always keeping one", async () => {
    const list = recipients(["info@alhidaya.qa"]);
    expect(screen.getByRole("group", { name: ADMIN_TEXT.enquiriesTo })).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.recipient, 1)),
      }),
    ).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addRecipient }));
    await userEvent.type(address(2), "care@alhidaya.qa");
    expect(list()).toEqual(["info@alhidaya.qa", "care@alhidaya.qa"]);
    await userEvent.click(
      screen.getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.recipient, 1)),
      }),
    );
    expect(list()).toEqual(["care@alhidaya.qa"]);
  });

  it("says which address is wrong, and stops adding at five", async () => {
    recipients(["info@alhidaya.qa", "not an address", "a@alhidaya.qa", "b@alhidaya.qa", "c@alhidaya.qa"]);
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addRecipient })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.email("Enquiry recipients"))).toBeVisible();
    expect(address(2)).toHaveAttribute("aria-invalid", "true");
    expect(LIST_LIMITS.recipients).toBe(5);
  });

  it("says when the list repeats an address", async () => {
    recipients(["info@alhidaya.qa", "info@alhidaya.qa"]);
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.noRepeats("Enquiry recipients"))).toBeVisible();
  });
});
