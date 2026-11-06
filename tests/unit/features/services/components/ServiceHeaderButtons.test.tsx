import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { ServiceHeaderButtons } from "@/features/services/components/ServiceHeaderButtons";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { type ServiceDocument, type ServiceDocumentInput, serviceDocumentSchema } from "@/lib/validation";
import { serviceFixture } from "@tests/support/fixtures/content";

function Editor({
  initial = serviceFixture(),
  save,
}: {
  initial?: ServiceDocument;
  save: (value: ServiceDocument) => void;
}) {
  const form = useForm<ServiceDocumentInput, unknown, ServiceDocument>({
    defaultValues: initial,
    resolver: zodResolver(serviceDocumentSchema),
  });
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(save)}>
        <ServiceHeaderButtons />
        <button type="submit">Save</button>
      </form>
    </FormProvider>
  );
}

describe("ServiceHeaderButtons", () => {
  it("starts hidden, permits two labelled links, reorders them, and removes a button before saving", async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    render(<Editor save={save} />);
    const add = screen.getByRole("button", { name: ADMIN_TEXT.addServiceButton });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(add);
    await user.click(add);
    expect(add).toBeDisabled();
    const first = screen.getByRole("group", { name: "Header button 1" });
    const second = screen.getByRole("group", { name: "Header button 2" });
    await user.type(within(first).getByRole("textbox", { name: ADMIN_TEXT.buttonLabel }), "Ask us");
    await user.type(within(first).getByRole("textbox", { name: ADMIN_TEXT.buttonLink }), "/contact");
    await user.type(within(second).getByRole("textbox", { name: ADMIN_TEXT.buttonLabel }), "Get a quote");
    await user.type(within(second).getByRole("textbox", { name: ADMIN_TEXT.buttonLink }), "/request-a-quote");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, "Header button 1") }));
    expect(screen.getAllByRole("textbox", { name: ADMIN_TEXT.buttonLabel })[0]).toHaveValue("Get a quote");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, "Header button 2") }));
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Header button 2") }));
    expect(add).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ headerButtons: [{ label: { en: "Ask us" }, href: "/contact" }] }),
      expect.anything(),
    );
  });
  it("displays the schema's list error for an oversized record", async () => {
    render(
      <Editor
        save={vi.fn()}
        initial={serviceFixture({ headerButtons: Array(3).fill({ label: { en: "Link" }, href: "/contact" }) })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText(VALIDATION_MESSAGES.atMost("Header buttons", 2))).toBeInTheDocument();
  });
});
