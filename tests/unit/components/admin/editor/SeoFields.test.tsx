import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SeoFields } from "@/components/admin/editor/SeoFields";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import { EditorForm } from "@tests/support/editor-form";

describe("SeoFields", () => {
  it("are the words search engines read, each optional and bounded, with what stands in when empty (plan §19)", () => {
    render(
      <EditorForm values={{ seo: { title: { en: "Elderly care at home" }, description: { en: null } } }}>
        <SeoFields hint={ADMIN_TEXT.serviceSeoHint} />
      </EditorForm>,
    );
    const group = screen.getByRole("region", { name: ADMIN_TEXT.seo });
    expect(group).toHaveTextContent(ADMIN_TEXT.serviceSeoHint);
    const title = screen.getByRole("textbox", { name: `${ADMIN_TEXT.seoTitle} (${UI_TEXT.optional})` });
    expect(title).toHaveValue("Elderly care at home");
    expect(title).toHaveAttribute("maxlength", String(TEXT_LIMITS.seoTitle));
    expect(screen.getByRole("textbox", { name: `${ADMIN_TEXT.seoDescription} (${UI_TEXT.optional})` })).toHaveValue("");
  });

  it("asks for the site's own defaults, which every page falls back to", () => {
    render(
      <EditorForm values={{ seo: { title: { en: "" }, description: { en: "" } } }}>
        <SeoFields hint={ADMIN_TEXT.siteSeoHint} required />
      </EditorForm>,
    );
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.seoTitle })).toBeRequired();
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.seoDescription })).toBeRequired();
  });
});
