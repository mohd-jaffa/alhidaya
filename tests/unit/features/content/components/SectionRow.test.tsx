import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import type { PageKey } from "@/constants/sections";
import { SectionRow } from "@/features/content/components/SectionRow";
import { stubApi, stubDialogs, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";
import { pageFixture, section } from "@tests/support/fixtures/content";

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

function row(page: PageKey, index: number, sections = pageFixture(page).sections, open = false) {
  stubApi(() => ({ data: [] }));
  const calls = { onToggle: vi.fn(), onMove: vi.fn(), onRemove: vi.fn(), onDragStart: vi.fn(), onDragEnd: vi.fn() };
  let form!: UseFormReturn<FieldValues>;
  render(
    <WithSWR>
      <EditorForm values={{ sections }} onForm={(methods) => (form = methods)}>
        <SectionRow page={page} index={index} open={open} {...calls} />
      </EditorForm>
    </WithSWR>,
  );
  return { ...calls, form: () => form };
}

describe("SectionRow", () => {
  it("allows Careers' header to hide and move, but retains its content for restoration (D148)", async () => {
    const { form, onMove } = row("CAREERS", 0);
    expect(document.querySelector("[draggable]")).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.hide, "Page header") }));
    expect(form().getValues("sections.0.visible")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.show, "Page header") }));
    expect(form().getValues("sections.0.visible")).toBe(true);
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Page header") }),
    );
    expect(onMove).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Page header") })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
  it("names its place, its kind and what it says first, and opens with its fields where it is", async () => {
    const { onToggle } = row("HOME", 1);
    const toggle = screen.getByRole("button", { expanded: false });
    expect(toggle).toHaveTextContent(/^2IntroductionWho we areEdit$/);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows its fields when open, and Close", () => {
    row("HOME", 1, undefined, true);
    expect(screen.getByRole("button", { name: /Close$/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.heading })).toHaveValue("Who we are");
  });

  it("hides a section and shows it again, keeping its content (plan §7.1)", async () => {
    const { form } = row("HOME", 1);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.hide, "Introduction") }));
    expect(form().getValues("sections.1.visible")).toBe(false);
    expect(screen.getByText(ADMIN_TEXT.hidden)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.show, "Introduction") }));
    expect(form().getValues("sections.1.visible")).toBe(true);
  });

  it("removes a section only once asked, and Keep it leaves it (D87)", async () => {
    const { onRemove } = row("HOME", 1);
    const remove = screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Introduction") });
    await userEvent.click(remove);
    const dialog = screen.getByRole("dialog", { name: ADMIN_TEXT.removeSectionTitle("Introduction") });
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.keep }));
    expect(onRemove).not.toHaveBeenCalled();
    await userEvent.click(remove);
    await userEvent.click(within(dialog).getByRole("button", { name: ADMIN_TEXT.remove }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("moves a section up or down, never above the sign", async () => {
    const { onMove } = row("HOME", 1);
    const up = screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, "Introduction") });
    expect(up).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Introduction") }),
    );
    expect(onMove).toHaveBeenCalledWith(2);
  });

  it("keeps the sign first: no handle, no hide, no move, no remove", () => {
    row("HOME", 0);
    expect(screen.getByText(ADMIN_TEXT.alwaysFirst)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Hide|Move|Remove/ })).toBeNull();
    expect(document.querySelector("[draggable]")).toBeNull();
  });

  it("keeps a section the page needs visible and there, though it may move", () => {
    row("QUOTE", 1);
    expect(screen.getByText(ADMIN_TEXT.pageNeedsIt)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Hide/ })).toBeNull();
    expect(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Form") })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("is dragged by its handle, the row as the picture, and says when it holds a field to correct", () => {
    const { onDragStart, onDragEnd, form } = row("PRIVACY", 1, [
      ...pageFixture("PRIVACY").sections,
      section("RICH_TEXT"),
    ]);
    const handle = document.querySelector<HTMLElement>("[draggable]")!;
    const dataTransfer = { effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() };
    fireEvent.dragStart(handle, { dataTransfer });
    expect(onDragStart).toHaveBeenCalledOnce();
    expect(dataTransfer.effectAllowed).toBe("move");
    expect(dataTransfer.setDragImage).toHaveBeenCalledWith(handle.closest("article"), 24, 24);
    fireEvent.dragEnd(handle);
    expect(onDragEnd).toHaveBeenCalledOnce();

    expect(screen.queryByText(ADMIN_TEXT.needsAttention)).toBeNull();
    act(() => form().setError("sections.1.content.heading.en", { message: "Heading is too long." }));
    expect(screen.getByText(ADMIN_TEXT.needsAttention)).toBeVisible();
  });
});
