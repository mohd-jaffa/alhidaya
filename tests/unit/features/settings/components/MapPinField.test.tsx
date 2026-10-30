import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { SEED_SITE } from "@/db/seed/content";
import { MapPinField } from "@/features/settings/components/MapPinField";
import { siteDocumentSchema } from "@/lib/validation";
import { EditorForm } from "@tests/support/editor-form";

function pin(mapPin: unknown) {
  let form!: UseFormReturn<FieldValues>;
  render(
    <EditorForm
      values={{ ...SEED_SITE, contact: { ...SEED_SITE.contact, mapPin } }}
      schema={siteDocumentSchema}
      onForm={(methods) => (form = methods)}
    >
      <MapPinField name="contact.mapPin" />
    </EditorForm>,
  );
  return () => form.getValues("contact.mapPin");
}

const latitude = () => screen.getByRole("textbox", { name: ADMIN_TEXT.latitude });
const longitude = () => screen.getByRole("textbox", { name: ADMIN_TEXT.longitude });

describe("MapPinField (D74)", () => {
  it("keeps the office's spot as numbers, both or neither", async () => {
    const value = pin(null);
    expect(screen.getByRole("group", { name: ADMIN_TEXT.mapPin })).toBeVisible();
    await userEvent.type(latitude(), "25.2854");
    await userEvent.type(longitude(), "51.5310");
    expect(value()).toEqual({ lat: 25.2854, lon: 51.531 });
    await userEvent.clear(latitude());
    await userEvent.clear(longitude());
    expect(value()).toBeNull();
  });

  it("starts from the spot as kept, and says when half of it, or a number off the map, is given", async () => {
    pin({ lat: 25.2854, lon: 51.531 });
    expect(latitude()).toHaveValue("25.2854");
    await userEvent.clear(longitude());
    await userEvent.clear(latitude());
    await userEvent.type(latitude(), "95");
    await userEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.between("Latitude", -90, 90))).toBeVisible();
    expect(screen.getByText(VALIDATION_MESSAGES.between("Longitude", -180, 180))).toBeVisible();
  });
});
