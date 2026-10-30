import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS } from "@/constants/limits";
import { RichTextField } from "@/features/content/components/RichTextField";
import { EditorForm } from "@tests/support/editor-form";

const BODY = [
  { type: "heading", text: { en: "What we collect" } },
  { type: "paragraph", text: { en: "Your name and phone number." } },
  { type: "list", items: [{ en: "When you send a form" }, { en: "When you apply" }] },
  { type: "link", label: { en: "Contact us" }, href: "/contact" },
];

function field(body: unknown[]) {
  let form!: UseFormReturn<FieldValues>;
  render(
    <EditorForm values={{ body }} onForm={(methods) => (form = methods)}>
      <RichTextField name="body" label="Text" />
    </EditorForm>,
  );
  return () => form.getValues("body") as { type: string }[];
}

const action = (name: string, thing: string) => screen.getByRole("button", { name: ADMIN_TEXT.actionOn(name, thing) });

describe("RichTextField", () => {
  it("shows each block as its own field, numbered by its kind (D90)", () => {
    field(BODY);
    expect(screen.getByRole("group", { name: "Text" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Heading 1" })).toHaveValue("What we collect");
    expect(screen.getByRole("textbox", { name: "Paragraph 2" })).toHaveValue("Your name and phone number.");
    expect(screen.getByRole("textbox", { name: "List item 2" })).toHaveValue("When you apply");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.linkText })).toHaveValue("Contact us");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.linkAddress })).toHaveAccessibleDescription(
      ADMIN_TEXT.linkHint,
    );
  });

  it("adds a block of each kind at the end, blank, and moves and removes one at a time", async () => {
    const values = field([BODY[1]]);
    for (const add of [ADMIN_TEXT.addHeading, ADMIN_TEXT.addList, ADMIN_TEXT.addLink, ADMIN_TEXT.addParagraph]) {
      await userEvent.click(screen.getByRole("button", { name: add }));
    }
    expect(values().map((block) => block.type)).toEqual(["paragraph", "heading", "list", "link", "paragraph"]);
    expect(values()[2]).toEqual({ type: "list", items: [{ en: "" }] });

    await userEvent.click(action(ADMIN_TEXT.moveDown, "Paragraph 1"));
    expect(values().map((block) => block.type)).toEqual(["heading", "paragraph", "list", "link", "paragraph"]);
    await userEvent.click(action(ADMIN_TEXT.moveUp, "Link 4"));
    await userEvent.click(action(ADMIN_TEXT.remove, "Paragraph 5"));
    expect(values().map((block) => block.type)).toEqual(["heading", "paragraph", "link", "list"]);
  });

  it("keeps a list at one line or more, and adds lines up to its limit", async () => {
    const values = field([BODY[2]]);
    await userEvent.click(action(ADMIN_TEXT.remove, "List item 1"));
    expect(action(ADMIN_TEXT.remove, "List item 1")).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addItem }));
    await userEvent.click(action(ADMIN_TEXT.moveUp, "List item 2"));
    expect(values()[0]).toEqual({ type: "list", items: [{ en: "" }, { en: "When you apply" }] });
  });

  it("says when there is no text yet", () => {
    field([]);
    expect(screen.getByText(ADMIN_TEXT.noBlocks)).toBeVisible();
  });

  it("offers no more blocks, or list lines, past their limits", () => {
    field([
      { type: "list", items: Array.from({ length: LIST_LIMITS.jobPoints }, () => ({ en: "A line" })) },
      ...Array.from({ length: LIST_LIMITS.richBlocks - 1 }, () => BODY[1]),
    ]);
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addParagraph })).toBeNull();
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addItem })).toBeNull();
  });

  it("shows what is wrong with the whole text or a list under it", () => {
    let form!: UseFormReturn<FieldValues>;
    render(
      <EditorForm values={{ body: [BODY[2]] }} onForm={(methods) => (form = methods)}>
        <RichTextField name="body" label="Text" />
      </EditorForm>,
    );
    act(() => {
      form.setError("body.root", { message: "The text needs at least one." });
      form.setError("body.0.items.root", { message: "A list needs at least one." });
    });
    const group = screen.getByRole("group", { name: "Text" });
    expect(within(group).getByText("The text needs at least one.")).toBeVisible();
    expect(within(group).getByText("A list needs at least one.")).toBeVisible();
  });
});
