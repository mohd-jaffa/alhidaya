import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { EditorText } from "@/components/admin/editor/EditorText";
import { SlugField } from "@/components/admin/editor/SlugField";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ROUTES } from "@/constants/routes";
import { EditorForm } from "@tests/support/editor-form";

function service(values: FieldValues, follow: boolean) {
  let form: UseFormReturn<FieldValues> | undefined;
  render(
    <EditorForm values={values} onForm={(methods) => (form = methods)}>
      <EditorText name="name.en" label="Name" max={100} required />
      <SlugField from="name.en" address={ROUTES.service} follow={follow} />
    </EditorForm>,
  );
  return { form: () => form!, name: screen.getByRole("textbox", { name: "Name" }) };
}

const address = () => screen.getByRole("textbox", { name: ADMIN_TEXT.webAddress });

describe("SlugField (D92)", () => {
  it("follows the name while it is the name's and never published, showing the address it gives", async () => {
    const { name } = service({ name: { en: "" }, slug: "" }, true);
    expect(address()).toHaveAccessibleDescription(ADMIN_TEXT.webAddressHint(ROUTES.service("…"), true));
    await userEvent.type(name, "Elderly Care");
    expect(address()).toHaveValue("elderly-care");
    expect(address()).toHaveAccessibleDescription(ADMIN_TEXT.webAddressHint(ROUTES.service("elderly-care"), true));
  });

  it("stays as the admin typed it once they edit it", async () => {
    const { name } = service({ name: { en: "Elderly care" }, slug: "elderly-care" }, true);
    await userEvent.clear(address());
    await userEvent.type(address(), "care-for-older-people");
    await userEvent.type(name, " at home");
    expect(address()).toHaveValue("care-for-older-people");
  });

  it("never moves a published address on its own", async () => {
    const { name, form } = service({ name: { en: "Elderly care" }, slug: "elderly-care" }, false);
    await userEvent.type(name, " at home");
    expect(form().getValues("slug")).toBe("elderly-care");
    expect(address()).toHaveAccessibleDescription(ADMIN_TEXT.webAddressHint(ROUTES.service("elderly-care"), false));
  });
});
