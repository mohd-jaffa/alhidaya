import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PAGE_NAMES } from "@/constants/messages";
import type { PageKey, SectionType } from "@/constants/sections";
import { SectionFields } from "@/features/content/components/SectionFields";
import { stubApi, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";
import { contentFixture } from "@tests/support/fixtures/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

let form: UseFormReturn<FieldValues>;

function fields(type: SectionType, page: PageKey = "ABOUT", content: object = contentFixture(type)) {
  stubApi(() => ({ data: [] }));
  render(
    <WithSWR>
      <EditorForm
        values={{ sections: [{ id: "s", type, visible: true, content }] }}
        onForm={(methods) => {
          form = methods;
        }}
      >
        <SectionFields page={page} index={0} type={type} />
      </EditorForm>
    </WithSWR>,
  );
}

describe("SectionFields", () => {
  it("lays out the sign's headline, its highlighted words, supporting line and photo, and no hero's (D109)", () => {
    fields("SIGN");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.headline })).toHaveValue("Nursing care, at your doorstep");
    expect(screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.highlight) })).toBeVisible();
    expect(screen.queryByRole("group", { name: ADMIN_TEXT.faces })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Supporting line/ }).tagName).toBe("TEXTAREA");
    expect(screen.getByRole("group", { name: /Photo/ })).toBeVisible();
  });

  it("gives an introduction its text block by block, and values their list", () => {
    fields("INTRO");
    expect(screen.getByRole("group", { name: ADMIN_TEXT.text })).toBeVisible();
    fields("VALUES");
    expect(screen.getByRole("group", { name: ADMIN_TEXT.values })).toBeVisible();
  });

  it("lets a form section choose its form", () => {
    fields("FORM");
    const choice = screen.getByRole("combobox", { name: ADMIN_TEXT.whichForm });
    expect(choice).toHaveValue("CONTACT");
    expect(screen.getByRole("option", { name: PAGE_NAMES.QUOTE })).toBeInTheDocument();
  });

  it("gives Home's sign its hero's fields besides, and no other page's (D97)", () => {
    fields("SIGN", "HOME");
    expect(screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.highlight) })).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.faces })).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.chips })).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.heroCard })).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.heroNote })).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.heroFact })).toBeVisible();
  });

  it("starts a hero with no faces yet, ready for the first (D97)", async () => {
    fields("SIGN", "HOME", { ...contentFixture("SIGN"), avatars: undefined });
    const faces = screen.getByRole("group", { name: ADMIN_TEXT.faces });
    expect(within(faces).queryAllByRole("listitem")).toHaveLength(0);
    await userEvent.click(within(faces).getByRole("button", { name: ADMIN_TEXT.addFace }));
    expect(form.getValues("sections.0.content.avatars")).toEqual([null]);
  });

  it("writes a chip as plain words, adds one up to three, and takes one away (D97)", async () => {
    fields("SIGN", "HOME", { ...contentFixture("SIGN"), chips: [{ en: "At home" }] });
    const chips = screen.getByRole("group", { name: ADMIN_TEXT.chips });
    expect(within(chips).getByRole("textbox", { name: new RegExp(ADMIN_TEXT.chip) })).toHaveValue("At home");
    await userEvent.click(within(chips).getByRole("button", { name: ADMIN_TEXT.addChip }));
    await userEvent.click(within(chips).getByRole("button", { name: ADMIN_TEXT.addChip }));
    expect(form.getValues("sections.0.content.chips")).toEqual([{ en: "At home" }, { en: "" }, { en: "" }]);
    expect(within(chips).queryByRole("button", { name: ADMIN_TEXT.addChip })).toBeNull();
    await userEvent.click(
      within(chips).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.chip, 2)),
      }),
    );
    expect(form.getValues("sections.0.content.chips")).toHaveLength(2);
  });

  it("picks an icon by its name or none, and marks a phrase darker (D97)", async () => {
    fields("STATEMENT");
    const [first, second] = screen.getAllByRole("combobox", { name: new RegExp(`^${ADMIN_TEXT.icon}`) });
    expect(first).toHaveValue("");
    expect(second).toHaveValue("heart");
    await userEvent.selectOptions(first, ADMIN_TEXT.pictogramNames.globe);
    await userEvent.selectOptions(second, ADMIN_TEXT.noIcon);
    const [darker] = screen.getAllByRole("checkbox", { name: ADMIN_TEXT.partStrong });
    await userEvent.click(darker);
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(form.getValues("sections.0.content.parts")).toMatchObject([
      { pictogram: "globe", strong: true },
      { pictogram: null, strong: true },
    ]);
  });

  it("adds a blank phrase, and keeps the statement's last one (D97)", async () => {
    fields("STATEMENT", "HOME", { parts: [{ text: { en: "Care" }, strong: false, pictogram: null }] });
    const phrases = screen.getByRole("group", { name: ADMIN_TEXT.statementParts });
    expect(
      within(phrases).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.part, 1)),
      }),
    ).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(within(phrases).getByRole("button", { name: ADMIN_TEXT.addPart }));
    expect(form.getValues("sections.0.content.parts")[1]).toEqual({ text: { en: "" }, strong: false, pictogram: null });
  });

  it("adds a face to pick, up to its limit, moves one and takes one away (D97)", async () => {
    fields("HIGHLIGHTS", "HOME", {
      ...contentFixture("HIGHLIGHTS"),
      accent: {
        ...contentFixture("HIGHLIGHTS").accent,
        avatars: [{ mediaId: "a" }, { mediaId: "b" }, { mediaId: "c" }],
      },
    });
    const accent = screen.getByRole("group", { name: ADMIN_TEXT.accentCard });
    const faces = within(accent).getByRole("group", { name: ADMIN_TEXT.faces });
    await userEvent.click(within(faces).getByRole("button", { name: ADMIN_TEXT.addFace }));
    expect(form.getValues("sections.0.content.accent.avatars")).toEqual([
      { mediaId: "a" },
      { mediaId: "b" },
      { mediaId: "c" },
      null,
    ]);
    expect(within(faces).queryByRole("button", { name: ADMIN_TEXT.addFace })).toBeNull();
    await userEvent.click(
      within(faces).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, ADMIN_TEXT.numbered(ADMIN_TEXT.face, 1)),
      }),
    );
    await userEvent.click(
      within(faces).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.face, 4)),
      }),
    );
    expect(form.getValues("sections.0.content.accent.avatars")).toEqual([
      { mediaId: "b" },
      { mediaId: "a" },
      { mediaId: "c" },
    ]);
  });

  it("moves an item in a list, and opens an audience's heading in its two parts (D97)", async () => {
    fields("FOR_INSTITUTIONS", "HOME", {
      ...contentFixture("FOR_INSTITUTIONS"),
      facts: [
        { value: { en: "24/7" }, label: { en: "Around the clock" } },
        { value: { en: "8" }, label: { en: "Services" } },
      ],
    });
    expect(screen.getByRole("textbox", { name: new RegExp(`^${ADMIN_TEXT.pillLabel}`) })).toHaveValue(
      "For institutions",
    );
    expect(screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.headingEnd) })).toHaveValue(
      "hospitals and schools",
    );
    const figures = screen.getByRole("group", { name: ADMIN_TEXT.figures });
    await userEvent.click(
      within(figures).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, ADMIN_TEXT.numbered(ADMIN_TEXT.figure, 2)),
      }),
    );
    expect(form.getValues("sections.0.content.facts.0.value")).toEqual({ en: "8" });
  });

  it("names an error on a list as a whole", async () => {
    fields("FOR_FAMILIES", "HOME", { ...contentFixture("FOR_FAMILIES"), steps: [] });
    form.setError("sections.0.content.steps", { type: "server", message: "Two steps at least." });
    expect(await screen.findByText("Two steps at least.")).toBeVisible();
  });

  it("names an error on a group of faces as a whole", async () => {
    fields("FOR_INSTITUTIONS", "HOME");
    form.setError("sections.0.content.team.avatars", { type: "server", message: "Faces can hold at most 5." });
    expect(await screen.findByText("Faces can hold at most 5.")).toBeVisible();
  });

  it("says what a section shows on its own, and where that is changed", () => {
    fields("CONTACT_DETAILS");
    expect(screen.getByText(ADMIN_TEXT.sectionShows.CONTACT_DETAILS!)).toBeVisible();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.heading })).toHaveValue("Contact");
  });
});
