import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { PointsField } from "@/components/admin/editor/PointsField";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { EditorForm } from "@tests/support/editor-form";

describe("PointsField", () => {
  it("is a list of lines that may be empty, each removable, up to its limit", async () => {
    let form: UseFormReturn<FieldValues> | undefined;
    render(
      <EditorForm values={{ included: [] }} onForm={(methods) => (form = methods)}>
        <PointsField name="included" label="What's included" item="Included item" max={2} />
      </EditorForm>,
    );
    expect(screen.getByRole("group", { name: "What's included" })).toBeVisible();
    expect(screen.queryByRole("listitem")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addItem }));
    await userEvent.type(screen.getByRole("textbox", { name: "Included item 1" }), "Wound care");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addItem }));
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addItem })).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Included item 2") }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Included item 1") }),
    );
    expect(form!.getValues("included")).toEqual([]);
  });

  it("keeps its name for screen readers alone when its group says it", () => {
    render(
      <EditorForm values={{ benefits: [] }}>
        <PointsField name="benefits" label="Benefits" item="Benefit" max={3} hideLabel />
      </EditorForm>,
    );
    expect(screen.getByText("Benefits")).toHaveClass("sr-only");
  });
});
