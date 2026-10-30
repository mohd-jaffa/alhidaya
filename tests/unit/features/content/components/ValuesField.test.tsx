import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS } from "@/constants/limits";
import { ValuesField } from "@/features/content/components/ValuesField";
import { EditorForm } from "@tests/support/editor-form";

const value = (title: string) => ({ title: { en: title }, text: { en: null } });

describe("ValuesField", () => {
  it("lists each value as a title and a line, adds up to six, and keeps at least one", async () => {
    let form!: UseFormReturn<FieldValues>;
    render(
      <EditorForm values={{ items: [value("Day and night")] }} onForm={(methods) => (form = methods)}>
        <ValuesField name="items" label={ADMIN_TEXT.values} />
      </EditorForm>,
    );
    expect(screen.getByRole("group", { name: ADMIN_TEXT.values })).toBeVisible();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.valueTitle })).toHaveValue("Day and night");
    const remove = () => screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Value 1") });
    expect(remove()).toHaveAttribute("aria-disabled", "true");

    for (let added = 1; added < LIST_LIMITS.values; added += 1) {
      await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addValue }));
    }
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addValue })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Value 1") }));
    await userEvent.click(remove());
    expect(form.getValues("items")).toHaveLength(LIST_LIMITS.values - 1);
    expect(form.getValues("items.0")).toEqual(value("Day and night"));

    act(() => form.setError("items.root", { message: "Values can hold at most 6." }));
    expect(screen.getByText("Values can hold at most 6.")).toBeVisible();
  });
});
