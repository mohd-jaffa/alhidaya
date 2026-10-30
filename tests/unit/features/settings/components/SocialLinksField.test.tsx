import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { SOCIAL_NETWORKS } from "@/constants/statuses";
import { SEED_SITE } from "@/db/seed/content";
import { SocialLinksField } from "@/features/settings/components/SocialLinksField";
import { siteDocumentSchema } from "@/lib/validation";
import { EditorForm } from "@tests/support/editor-form";

function social(links: { network: string; url: string }[]) {
  let form!: UseFormReturn<FieldValues>;
  render(
    <EditorForm
      values={{ ...SEED_SITE, social: links }}
      schema={siteDocumentSchema}
      onForm={(methods) => (form = methods)}
    >
      <SocialLinksField />
    </EditorForm>,
  );
  return () => form.getValues("social");
}

describe("SocialLinksField", () => {
  it("adds a link for a network not listed yet, and removes one", async () => {
    const links = social(SEED_SITE.social);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.addSocial }));
    expect(links()).toEqual([...SEED_SITE.social, { network: "FACEBOOK", url: "" }]);
    const second = ADMIN_TEXT.numbered(ADMIN_TEXT.socialLink, 2);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, second) }));
    expect(links()).toEqual([{ network: "FACEBOOK", url: "" }, ...SEED_SITE.social]);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, second) }));
    await userEvent.click(
      screen.getByRole("button", {
        name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, ADMIN_TEXT.numbered(ADMIN_TEXT.socialLink, 1)),
      }),
    );
    expect(links()).toEqual([{ network: "FACEBOOK", url: "" }]);
  });

  it("offers no more once every network is listed, and says when one is listed twice", async () => {
    social(SOCIAL_NETWORKS.map((network) => ({ network: "INSTAGRAM", url: `https://example.org/${network}` })));
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.noRepeats("Social links"))).toBeVisible();
  });

  it("offers nothing to add when every network has its link", () => {
    social(SOCIAL_NETWORKS.map((network) => ({ network, url: "https://example.org" })));
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.addSocial })).toBeNull();
  });
});
