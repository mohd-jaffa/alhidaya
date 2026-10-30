import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { SEED_SITE } from "@/db/seed/content";
import { FooterField } from "@/features/settings/components/FooterField";
import { siteDocumentSchema } from "@/lib/validation";
import { stubApi, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

function footer(columns: unknown[]) {
  stubApi(() => ({ data: { items: [], order: {} } }));
  let form!: UseFormReturn<FieldValues>;
  render(
    <WithSWR>
      <EditorForm
        values={{ ...SEED_SITE, footer: columns }}
        schema={siteDocumentSchema}
        onForm={(methods) => (form = methods)}
      >
        <FooterField />
      </EditorForm>
    </WithSWR>,
  );
  return () => form.getValues("footer");
}

describe("FooterField (D94)", () => {
  it("edits each column's heading and links; moves, removes and adds columns and links", async () => {
    const columns = footer(SEED_SITE.footer);
    const firstColumn = ADMIN_TEXT.numbered(ADMIN_TEXT.footerColumn, 1);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, firstColumn) }));
    expect(columns().map((column: { heading: { en: string } }) => column.heading.en)).toEqual(["Legal", "Company"]);
    const firstLink = ADMIN_TEXT.numbered(ADMIN_TEXT.footerLink, 1);
    await userEvent.click(
      screen.getAllByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, firstLink) })[0],
    );
    expect(columns()[0].links.map((link: { label: { en: string } }) => link.label.en)).toEqual(["Terms", "Privacy"]);
    await userEvent.click(
      screen.getAllByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, firstLink) })[0],
    );
    expect(columns()[0].links).toHaveLength(1);
    await userEvent.click(screen.getAllByRole("button", { name: ADMIN_TEXT.addLink })[0]);
    expect(columns()[0].links.at(-1)).toEqual({ label: { en: "" }, href: "" });
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addColumn }));
    expect(columns().at(-1)).toEqual({ heading: { en: "" }, links: [] });
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, firstColumn) }));
    expect(columns()).toHaveLength(2);
  });

  it("says when a column holds more links than it may", async () => {
    const column = {
      heading: { en: "More" },
      links: Array.from({ length: LIST_LIMITS.footerLinks + 1 }, () => SEED_SITE.footer[1].links[0]),
    };
    footer([column]);
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.atMost("A column", LIST_LIMITS.footerLinks))).toBeVisible();
  });

  it("says when the footer holds more columns than it may", async () => {
    footer(Array.from({ length: LIST_LIMITS.footerColumns + 1 }, () => SEED_SITE.footer[1]));
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.atMost("The footer", LIST_LIMITS.footerColumns))).toBeVisible();
  });

  it("stops adding at each limit, and says what is wrong with a column", async () => {
    const full = {
      heading: { en: "" },
      links: Array.from({ length: LIST_LIMITS.footerLinks }, () => SEED_SITE.footer[1].links[0]),
    };
    footer(Array.from({ length: LIST_LIMITS.footerColumns }, () => full));
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addColumn })).toBeNull();
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addLink })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect((await screen.findAllByText(/Column heading is required/))[0]).toBeVisible();
  });
});
