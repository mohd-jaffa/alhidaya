import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT, SECTION_NAMES } from "@/constants/admin-messages";
import type { PageKey } from "@/constants/sections";
import { SectionList } from "@/features/content/components/SectionList";
import { stubApi, stubDialogs, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";
import { pageFixture } from "@tests/support/fixtures/content";

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

function list(page: PageKey, openId: string | null = null) {
  stubApi(() => ({ data: [] }));
  const onOpen = vi.fn();
  let form!: UseFormReturn<FieldValues>;
  render(
    <WithSWR>
      <EditorForm values={pageFixture(page)} onForm={(methods) => (form = methods)}>
        <SectionList page={page} openId={openId} onOpen={onOpen} />
      </EditorForm>
    </WithSWR>,
  );
  const types = () => (form.getValues("sections") as { type: string }[]).map((section) => section.type);
  return { onOpen, types, form: () => form };
}

const rows = () => screen.getAllByRole("listitem").filter((item) => item.querySelector("article"));
const dataTransfer = () => ({ effectAllowed: "", setData: vi.fn(), setDragImage: vi.fn() });

describe("SectionList", () => {
  it("can move Careers' header down and drag it back to the first position (D148)", async () => {
    const { types } = list("CAREERS");
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Page header") }),
    );
    expect(types()).toEqual(["JOBS_LIST", "SIGN"]);
    fireEvent.dragStart(rows()[1].querySelector<HTMLElement>("[draggable]")!, { dataTransfer: dataTransfer() });
    fireEvent.dragOver(rows()[0]);
    fireEvent.drop(rows()[0]);
    expect(types()).toEqual(["SIGN", "JOBS_LIST"]);
  });
  it("lists a page's sections in order, opening the one asked for", async () => {
    const page = pageFixture("HOME");
    const { onOpen } = list("HOME");
    expect(rows()).toHaveLength(4);
    await userEvent.click(within(rows()[2]).getByRole("button", { expanded: false }));
    expect(onOpen).toHaveBeenCalledWith(expect.any(String));
    expect(onOpen.mock.calls[0][0]).not.toBe(page.sections[2].id);
  });

  it("closes the open section when its row is pressed again", async () => {
    const page = pageFixture("HOME");
    stubApi(() => ({ data: [] }));
    const onOpen = vi.fn();
    render(
      <WithSWR>
        <EditorForm values={page}>
          <SectionList page="HOME" openId={page.sections[1].id} onOpen={onOpen} />
        </EditorForm>
      </WithSWR>,
    );
    await userEvent.click(screen.getByRole("button", { expanded: true }));
    expect(onOpen).toHaveBeenCalledWith(null);
  });

  it("moves a section with Move up and Move down, and says where it went (D90)", async () => {
    const { types } = list("HOME");
    await userEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Introduction") }),
    );
    expect(types()).toEqual(["SIGN", "SERVICES_INDEX", "INTRO", "CONTACT_BAND"]);
    expect(screen.getByText(ADMIN_TEXT.movedTo("Introduction", 3, 4))).toBeInTheDocument();
  });

  it("is reordered by dragging a handle onto another row, the sky line marking where, never above the sign", () => {
    const { types } = list("HOME");
    const handles = document.querySelectorAll<HTMLElement>("[draggable]");
    fireEvent.dragStart(handles[2], { dataTransfer: dataTransfer() });
    fireEvent.dragOver(rows()[0]);
    expect(document.querySelector(".bg-sky.h-\\[3px\\]")).toBeNull();
    fireEvent.dragOver(rows()[1]);
    expect(document.querySelector(".bg-sky.h-\\[3px\\]")).not.toBeNull();
    fireEvent.drop(rows()[1]);
    expect(types()).toEqual(["SIGN", "CONTACT_BAND", "INTRO", "SERVICES_INDEX"]);
    expect(document.querySelector(".bg-sky.h-\\[3px\\]")).toBeNull();

    fireEvent.dragStart(document.querySelectorAll<HTMLElement>("[draggable]")[0], { dataTransfer: dataTransfer() });
    fireEvent.dragOver(rows()[3]);
    fireEvent.drop(rows()[3]);
    expect(types()).toEqual(["SIGN", "INTRO", "SERVICES_INDEX", "CONTACT_BAND"]);
  });

  it("ignores a drop in place, a drop with nothing dragged, and a row passed over with nothing dragged", () => {
    const { types } = list("HOME");
    fireEvent.dragOver(rows()[2]);
    fireEvent.drop(rows()[2]);
    const handle = document.querySelectorAll<HTMLElement>("[draggable]")[0];
    fireEvent.dragStart(handle, { dataTransfer: dataTransfer() });
    fireEvent.dragOver(rows()[1]);
    fireEvent.drop(rows()[1]);
    fireEvent.dragStart(handle, { dataTransfer: dataTransfer() });
    fireEvent.drop(rows()[2]);
    expect(types()).toEqual(["SIGN", "INTRO", "SERVICES_INDEX", "CONTACT_BAND"]);
  });

  it("adds a section the page can still hold at the end, opened, and removes one asked first (D87)", async () => {
    const { onOpen, types, form } = list("HOME");
    const add = screen.getByRole("button", { name: ADMIN_TEXT.add });
    expect(add).toBeDisabled();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: ADMIN_TEXT.addSection }), SECTION_NAMES.VALUES);
    await userEvent.click(add);
    expect(types()).toEqual(["SIGN", "INTRO", "SERVICES_INDEX", "CONTACT_BAND", "VALUES"]);
    expect(onOpen).toHaveBeenLastCalledWith(form().getValues("sections.4.id"));
    expect(screen.getByRole("combobox", { name: ADMIN_TEXT.addSection })).toHaveValue("");
    expect(screen.queryByRole("option", { name: SECTION_NAMES.VALUES })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Values") }));
    await userEvent.click(
      within(screen.getByRole("dialog", { name: ADMIN_TEXT.removeSectionTitle("Values") })).getByRole("button", {
        name: ADMIN_TEXT.remove,
      }),
    );
    expect(types()).toEqual(["SIGN", "INTRO", "SERVICES_INDEX", "CONTACT_BAND"]);
  });

  it("offers nothing to add once a page holds all it can", () => {
    list("QUOTE");
    expect(screen.queryByRole("combobox", { name: ADMIN_TEXT.addSection })).toBeNull();
  });
});
