import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ImageWords, imageWordsOf } from "@/components/admin/editor/ImageWords";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { EditorForm } from "@tests/support/editor-form";

describe("ImageWords (D93)", () => {
  it("asks what an image shows until it is marked decorative, with where it came from folded", async () => {
    render(
      <EditorForm values={imageWordsOf()}>
        <ImageWords />
      </EditorForm>,
    );
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.altText })).toBeRequired();
    expect(screen.getByText(ADMIN_TEXT.sourceTitle).closest("details")).not.toHaveAttribute("open");
    await userEvent.click(screen.getByRole("checkbox", { name: ADMIN_TEXT.decorative }));
    expect(screen.queryByRole("textbox", { name: ADMIN_TEXT.altText })).toBeNull();
  });

  it("starts from an image's words as kept, its source open when it has one", () => {
    const words = imageWordsOf({
      alt: "A nurse",
      decorative: false,
      source: { provider: "Unsplash", url: null, licence: null },
    });
    expect(words).toEqual({
      alt: "A nurse",
      decorative: false,
      source: { provider: "Unsplash", url: "", licence: "" },
    });
    expect(imageWordsOf({ alt: "ignored", decorative: true, source: null }).alt).toBe("");
    render(
      <EditorForm values={words}>
        <ImageWords />
      </EditorForm>,
    );
    expect(screen.getByText(ADMIN_TEXT.sourceTitle).closest("details")).toHaveAttribute("open");
    expect(screen.getByRole("textbox", { name: new RegExp(ADMIN_TEXT.sourceProvider) })).toHaveValue("Unsplash");
  });
});
