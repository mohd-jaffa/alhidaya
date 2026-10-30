import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ROUTES } from "@/constants/routes";
import { LinkTarget } from "@/features/settings/components/LinkTarget";
import { stubApi, WithSWR } from "@tests/support/api";
import { EditorForm } from "@tests/support/editor-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

const SERVICES = {
  items: [
    { id: "s1", name: "Elderly care", slug: "elderly-care", publishedAt: "2026-10-29T08:00:00Z", archivedAt: null },
    { id: "s2", name: "Draft care", slug: "draft-care", publishedAt: null, archivedAt: null },
    {
      id: "s3",
      name: "Old care",
      slug: "old-care",
      publishedAt: "2026-10-29T08:00:00Z",
      archivedAt: "2026-10-30T08:00:00Z",
    },
  ],
  order: { publishedAt: null, unpublishedChanges: false },
};

function target(href: string | undefined) {
  stubApi(() => ({ data: SERVICES }));
  let form!: UseFormReturn<FieldValues>;
  render(
    <WithSWR>
      <EditorForm values={{ link: href === undefined ? {} : { href } }} onForm={(methods) => (form = methods)}>
        <LinkTarget name="link.href" />
      </EditorForm>
    </WithSWR>,
  );
  return () => form.getValues("link.href");
}

const goesTo = () => screen.getByRole("combobox", { name: ADMIN_TEXT.goesTo });

describe("LinkTarget (D94)", () => {
  it("picks a page, a published service or the brochure from a list", async () => {
    const href = target(ROUTES.about);
    expect(goesTo()).toHaveValue(ROUTES.about);
    await screen.findByRole("option", { name: `${ADMIN_TEXT.services} · Elderly care` });
    expect(screen.queryByRole("option", { name: /Draft care|Old care/ })).toBeNull();
    await userEvent.selectOptions(goesTo(), `${ADMIN_TEXT.services} · Elderly care`);
    expect(href()).toBe(ROUTES.service("elderly-care"));
    await userEvent.selectOptions(goesTo(), ADMIN_TEXT.brochure);
    expect(href()).toBe(ROUTES.brochure);
  });

  it("takes another address typed in, and shows one it does not list as typed", async () => {
    const href = target("https://www.moph.gov.qa");
    expect(goesTo()).toHaveValue("other");
    expect(screen.getByRole("textbox", { name: ADMIN_TEXT.linkAddress })).toHaveValue("https://www.moph.gov.qa");
    await userEvent.selectOptions(goesTo(), "Contact");
    expect(href()).toBe(ROUTES.contact);
    expect(screen.queryByRole("textbox", { name: ADMIN_TEXT.linkAddress })).toBeNull();
    await userEvent.selectOptions(goesTo(), ADMIN_TEXT.anotherAddress);
    expect(href()).toBe("");
    await userEvent.type(screen.getByRole("textbox", { name: ADMIN_TEXT.linkAddress }), "https://example.org");
    expect(href()).toBe("https://example.org");
  });

  it("starts empty for a new link, asking where it goes", () => {
    target(undefined);
    expect(goesTo()).toHaveValue("");
    expect(screen.queryByRole("textbox", { name: ADMIN_TEXT.linkAddress })).toBeNull();
  });
});
