import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PAGE_NAMES } from "@/constants/messages";
import type { SectionType } from "@/constants/sections";
import { SectionFields } from "@/features/content/components/SectionFields";
import { stubApi, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";
import { contentFixture } from "@tests/support/fixtures/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

function fields(type: SectionType) {
  stubApi(() => ({ data: [] }));
  render(
    <WithSWR>
      <EditorForm values={{ sections: [{ id: "s", type, visible: true, content: contentFixture(type) }] }}>
        <SectionFields index={0} type={type} />
      </EditorForm>
    </WithSWR>,
  );
}

describe("SectionFields", () => {
  it("lays out the sign's headline, supporting line and photo", () => {
    fields("SIGN");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.headline })).toHaveValue("Nursing care, at your doorstep");
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

  it("says what a section shows on its own, and where that is changed", () => {
    fields("CONTACT_DETAILS");
    expect(screen.getByText(ADMIN_TEXT.sectionShows.CONTACT_DETAILS!)).toBeVisible();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.heading })).toHaveValue("Contact");
  });
});
