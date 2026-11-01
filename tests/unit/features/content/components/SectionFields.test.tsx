import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import type { PageKey, SectionType } from "@/constants/sections";
import { SectionFields } from "@/features/content/components/SectionFields";
import { stubApi, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";
import { contentFixture, slideFixture } from "@tests/support/fixtures/content";

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
  it("lays out the sign's headline, its highlighted words, supporting line and photo, and no slides (D109)", () => {
    fields("SIGN");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.headline })).toHaveValue("Nursing care, at your doorstep");
    expect(screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.highlight) })).toBeVisible();
    expect(screen.queryByRole("group", { name: ADMIN_TEXT.slides })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Supporting line/ }).tagName).toBe("TEXTAREA");
    expect(screen.getByRole("group", { name: /Photo/ })).toBeVisible();
  });

  it("gives an introduction its highlighted words, its text block by block and its points, and values their list", () => {
    fields("INTRO");
    expect(screen.getByRole("group", { name: ADMIN_TEXT.text })).toBeVisible();
    expect(screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.highlight) })).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.points })).toBeVisible();
    fields("VALUES");
    expect(screen.getByRole("group", { name: ADMIN_TEXT.values })).toBeVisible();
  });

  it("lets a form section choose its form, the short quote among them (D130)", () => {
    fields("FORM");
    const choice = screen.getByRole("combobox", { name: ADMIN_TEXT.whichForm });
    expect(choice).toHaveValue("CONTACT");
    expect(screen.getByRole("option", { name: ADMIN_TEXT.formNames.QUOTE })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: ADMIN_TEXT.formNames.SHORT_QUOTE })).toBeInTheDocument();
  });

  it("gives Home's sign its slides, each with a button's wording and link, and the card on the photo (D128)", () => {
    fields("SIGN", "HOME", { ...contentFixture("SIGN"), slides: [slideFixture()] });
    const slides = screen.getByRole("group", { name: ADMIN_TEXT.slides });
    expect(within(slides).getByRole("textbox", { name: ADMIN_TEXT.headline })).toHaveValue(
      "Quality nursing care at your doorstep.",
    );
    expect(within(slides).getByRole("textbox", { name: new RegExp(ADMIN_TEXT.buttonLabel) })).toBeVisible();
    expect(within(slides).getByText(ADMIN_TEXT.buttonHint)).toBeVisible();
    expect(screen.getByRole("group", { name: ADMIN_TEXT.heroNote })).toBeVisible();
    // Home's hero has no headline of its own besides its slides'.
    expect(screen.getAllByRole("textbox", { name: ADMIN_TEXT.headline })).toHaveLength(1);
  });

  it("adds a slide up to the limit, moves one and keeps the last (D128)", async () => {
    const user = userEvent.setup();
    fields("SIGN", "HOME", {
      ...contentFixture("SIGN"),
      slides: [slideFixture(), slideFixture({ headline: { en: "Second slide" } })],
    });
    const slides = screen.getByRole("group", { name: ADMIN_TEXT.slides });
    await user.click(
      within(slides).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, ADMIN_TEXT.numbered(ADMIN_TEXT.slide, 2)),
      }),
    );
    expect(form.getValues("sections.0.content.slides.0.headline")).toEqual({ en: "Second slide" });
    await user.click(within(slides).getByRole("button", { name: ADMIN_TEXT.addSlide }));
    expect(form.getValues("sections.0.content.slides")).toHaveLength(3);
    expect(form.getValues("sections.0.content.slides.2")).toMatchObject({ image: null, buttonHref: { en: "" } });
    await user.click(
      within(slides).getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.slide, 3)),
      }),
    );
    expect(form.getValues("sections.0.content.slides")).toHaveLength(2);
  });

  it("offers no more slides once Home holds eight (D128)", () => {
    fields("SIGN", "HOME", {
      ...contentFixture("SIGN"),
      slides: Array.from({ length: 8 }, () => slideFixture()),
    });
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addSlide })).not.toBeInTheDocument();
  });

  it("picks an icon by its name or none", async () => {
    fields("SIGN", "HOME", { ...contentFixture("SIGN"), slides: [slideFixture()] });
    const icon = screen.getByRole("combobox", { name: new RegExp(`^${ADMIN_TEXT.icon}`) });
    await userEvent.selectOptions(icon, ADMIN_TEXT.pictogramNames.clock);
    expect(form.getValues("sections.0.content.note.pictogram")).toBe("clock");
    await userEvent.selectOptions(icon, ADMIN_TEXT.noIcon);
    expect(form.getValues("sections.0.content.note.pictogram")).toBeNull();
  });

  it("names an error on a list as a whole", async () => {
    fields("SIGN", "HOME", { ...contentFixture("SIGN"), slides: [] });
    form.setError("sections.0.content.slides", { type: "server", message: "Slides needs at least one." });
    expect(await screen.findByText("Slides needs at least one.")).toBeVisible();
  });

  it("says what a section shows on its own, and where that is changed", () => {
    fields("CONTACT_DETAILS");
    expect(screen.getByText(ADMIN_TEXT.sectionShows.CONTACT_DETAILS!)).toBeVisible();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.heading })).toHaveValue("Contact");
  });
});
