import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { UI_TEXT } from "@/constants/messages";
import { EditorText, useEditorError, useHasErrors } from "@/components/admin/editor/EditorText";
import { EditorForm } from "@tests/support/editor-form";

function Probe({ name }: { name: string }) {
  return (
    <p>
      {useHasErrors(name) ? "wrong" : "fine"}: {useEditorError(name) ?? "none"}
    </p>
  );
}

describe("EditorText", () => {
  it("is a labelled line bounded as its check is, or several lines, with its value as saved", () => {
    render(
      <EditorForm values={{ heading: { en: "Who we are" }, lede: { en: null } }}>
        <EditorText name="heading.en" label="Heading" max={120} required />
        <EditorText name="lede.en" label="Supporting line" max={300} multiline rows={2} hint="One sentence." />
      </EditorForm>,
    );
    const heading = screen.getByRole("textbox", { name: "Heading" });
    expect(heading).toHaveValue("Who we are");
    expect(heading).toHaveAttribute("maxlength", "120");
    expect(heading).toBeRequired();
    const lede = screen.getByRole("textbox", { name: `Supporting line (${UI_TEXT.optional})` });
    expect(lede.tagName).toBe("TEXTAREA");
    expect(lede).toHaveAttribute("rows", "2");
    expect(lede).toHaveValue("");
    expect(lede).toHaveAccessibleDescription("One sentence.");
  });

  it("keeps its label for screen readers alone when the block's name is in view", () => {
    render(
      <EditorForm values={{ text: { en: "" } }}>
        <EditorText name="text.en" label="Paragraph 2" max={2000} required multiline hideLabel />
      </EditorForm>,
    );
    expect(screen.getByRole("textbox", { name: "Paragraph 2" })).toBeVisible();
    expect(screen.getByText("Paragraph 2")).toHaveClass("sr-only");
  });

  it("shows its error beside it, and tells a part of the form, or a list's root, that something is wrong", () => {
    let form!: UseFormReturn<FieldValues>;
    render(
      <EditorForm values={{ section: { heading: { en: "" } }, items: [] }} onForm={(methods) => (form = methods)}>
        <EditorText name="section.heading.en" label="Heading" max={120} required />
        <Probe name="section" />
        <Probe name="items" />
      </EditorForm>,
    );
    expect(screen.getAllByText("fine: none")).toHaveLength(2);
    act(() => {
      form.setError("section.heading.en", { message: "Heading is required." });
      form.setError("items.root", { message: "Values needs at least one." });
    });
    expect(screen.getByRole("textbox", { name: "Heading" })).toHaveAccessibleDescription("Heading is required.");
    expect(screen.getByText("wrong: none")).toBeVisible();
    expect(screen.getByText("wrong: Values needs at least one.")).toBeVisible();
  });
});
