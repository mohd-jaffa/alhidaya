import { render, screen, fireEvent } from "@testing-library/react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { EditorDate } from "@/components/admin/editor/EditorDate";
import { UI_TEXT } from "@/constants/messages";
import { EditorForm } from "@tests/support/editor-form";

describe("EditorDate", () => {
  it("is the browser's own date field; one that may be empty is stored as none when cleared", () => {
    let form: UseFormReturn<FieldValues> | undefined;
    render(
      <EditorForm values={{ postedOn: "2026-10-30", closesOn: "2026-11-30" }} onForm={(methods) => (form = methods)}>
        <EditorDate name="postedOn" label="Posting date" required />
        <EditorDate name="closesOn" label="Closing date" hint="Optional." />
      </EditorForm>,
    );
    const posted = screen.getByLabelText("Posting date");
    expect(posted).toHaveAttribute("type", "date");
    expect(posted).toHaveValue("2026-10-30");
    const closes = screen.getByLabelText(`Closing date (${UI_TEXT.optional})`);
    fireEvent.change(closes, { target: { value: "" } });
    fireEvent.change(posted, { target: { value: "" } });
    expect(form!.getValues()).toMatchObject({ closesOn: null, postedOn: "" });
  });
});
