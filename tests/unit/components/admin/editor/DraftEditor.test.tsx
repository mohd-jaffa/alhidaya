import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { type DraftState } from "@/components/admin/editor/DraftStateChip";
import { EditorText } from "@/components/admin/editor/EditorText";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import { stubDialogs } from "@tests/support/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeAll(stubDialogs);

const schema = z.object({ name: z.string().min(1, "Name is required.") });
type Values = z.infer<typeof schema>;

/** A one-field thing in the editor, where it stands and what each action does given by the test. */
function Thing({
  state,
  path,
  save = async () => {},
  publish = async () => {},
  back = { href: "/admin/services", label: "Services" },
}: {
  state: DraftState;
  path: string | null;
  save?: (values: Values) => Promise<void>;
  publish?: () => Promise<void>;
  back?: { href: string; label: string } | null;
}) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "Elderly care" } });
  return (
    <DraftEditor
      form={form}
      name="Elderly care"
      back={back ?? undefined}
      state={state}
      path={path}
      save={save}
      publish={publish}
      discard={async () => {}}
    >
      <EditorText name="name" label="Name" max={100} required />
    </DraftEditor>
  );
}

const NEW: DraftState = { publishedAt: null, unpublishedChanges: true };

describe("DraftEditor (D88, D92)", () => {
  it("offers no Preview for what has no address yet, and Publish for what was never published", async () => {
    render(<Thing state={NEW} path={null} />);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/admin/services");
    expect(screen.queryByRole("link", { name: ADMIN_TEXT.preview })).toBeNull();
    expect(screen.getByText(ADMIN_TEXT.notPublishedYet)).toBeVisible();
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), " at home");
    expect(screen.queryByText(ADMIN_TEXT.previewHint)).toBeNull();
    expect(screen.getByRole("button", { name: ADMIN_TEXT.publish })).toBeEnabled();
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.discardDraft })).toBeNull();
  });

  it("previews at its address, and says it is published without a link once it is off the website", async () => {
    const publish = vi.fn(async () => {});
    render(
      <Thing
        state={{ publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true, archivedAt: "2026-10-30T08:00:00Z" }}
        path="/services/elderly-care"
        publish={publish}
      />,
    );
    expect(screen.getByRole("link", { name: ADMIN_TEXT.preview })).toHaveAttribute(
      "href",
      `${API_ROUTES.preview}?path=${encodeURIComponent("/services/elderly-care")}`,
    );
    expect(screen.getByText(ADMIN_TEXT.archived)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    await userEvent.click(screen.getAllByRole("button", { name: ADMIN_TEXT.publish })[1]);
    expect(await screen.findByText(ADMIN_TEXT.isPublished("Elderly care"))).toBeVisible();
    expect(publish).toHaveBeenCalledOnce();
    expect(screen.queryByRole("link", { name: ADMIN_TEXT.seeOnSite })).toBeNull();
  });

  it("marks a refused field where the server names it, and says a refusal that names none", async () => {
    const save = vi
      .fn<(values: Values) => Promise<void>>()
      .mockRejectedValueOnce(
        new ApiError(409, "SLUG_TAKEN", "Taken.", undefined, [{ path: "name", message: "Another one uses it." }]),
      )
      .mockRejectedValueOnce(new ApiError(500, "INTERNAL_ERROR", "Something went wrong."));
    render(<Thing state={NEW} path={null} save={save} />);
    const name = screen.getByRole("textbox", { name: "Name" });
    await userEvent.type(name, "!");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText("Another one uses it.")).toBeVisible();
    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.type(name, "?");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveDraft }));
    expect(await screen.findByText("Something went wrong.")).toBeVisible();
  });

  it("focuses the first wrong field when it fails its checks", async () => {
    render(<Thing state={NEW} path={null} />);
    const name = screen.getByRole("textbox", { name: "Name" });
    await userEvent.clear(name);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.publish }));
    expect(await screen.findByText("Name is required.")).toBeVisible();
    await waitFor(() => expect(name).toHaveFocus());
  });

  it("offers no way back for what has no list of its own: Settings", () => {
    render(<Thing state={NEW} path={null} back={null} />);
    expect(screen.queryByRole("link", { name: "Services" })).toBeNull();
  });
});
