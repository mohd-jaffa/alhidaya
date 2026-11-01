import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { NavigationField } from "@/features/settings/components/NavigationField";
import { siteDocumentSchema } from "@/lib/validation";
import { stubApi, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";
import { SEED_SITE } from "@/db/seed/content";

afterEach(() => {
  vi.unstubAllGlobals();
});

function menu(navigation: unknown[]) {
  stubApi(() => ({ data: { items: [], order: {} } }));
  let form!: UseFormReturn<FieldValues>;
  render(
    <WithSWR>
      <EditorForm
        values={{ ...SEED_SITE, navigation }}
        schema={siteDocumentSchema}
        onForm={(methods) => (form = methods)}
      >
        <NavigationField />
      </EditorForm>
    </WithSWR>,
  );
  return () => form.getValues("navigation");
}

describe("NavigationField (D94)", () => {
  it("edits each menu link's words, where it goes and whether it shows; moves, removes and adds them", async () => {
    const navigation = menu(SEED_SITE.navigation);
    const first = ADMIN_TEXT.numbered(ADMIN_TEXT.menuLink, 1);
    expect(screen.getAllByRole("switch", { name: ADMIN_TEXT.shownInMenu })[0]).toBeChecked();
    await userEvent.click(screen.getAllByRole("switch", { name: ADMIN_TEXT.shownInMenu })[0]);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, first) }));
    expect(navigation().map((link: { href: string; visible: boolean }) => [link.href, link.visible])).toEqual([
      [ROUTES.about, true],
      [ROUTES.home, false],
      [ROUTES.services, true],
      [ROUTES.careers, true],
      [ROUTES.contact, true],
    ]);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, first) }));
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addLink }));
    expect(navigation().at(-1)).toEqual({ label: { en: "" }, href: "", visible: true });
  });

  it("says when the menu holds more links than it may", async () => {
    menu(Array.from({ length: LIST_LIMITS.navigation + 1 }, () => SEED_SITE.navigation[0]));
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.atMost("The navigation", LIST_LIMITS.navigation))).toBeVisible();
  });

  it("stops adding at the limit, and says what is wrong with a link", async () => {
    menu([
      ...Array.from({ length: LIST_LIMITS.navigation - 1 }, () => SEED_SITE.navigation[0]),
      { label: { en: "" }, href: "/", visible: true },
    ]);
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addLink })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(/Link text is required/)).toBeVisible();
  });
});
