import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { DeleteAction } from "@/components/admin/DeleteAction";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ApiError } from "@/lib/api/client";
import { stubDialogs, WithSWR } from "@tests/support/api";

beforeAll(stubDialogs);

const action = (remove: () => Promise<unknown>, afterwards = vi.fn()) => {
  render(
    <DeleteAction
      title="Delete the enquiry from Omar Haddad?"
      body="It goes for good."
      remove={remove}
      revalidate={["/api/admin/enquiries"]}
      afterwards={afterwards}
    />,
    { wrapper: WithSWR },
  );
  return afterwards;
};

describe("DeleteAction (D82)", () => {
  it("asks first, and Keep it leaves everything as it was", async () => {
    const user = userEvent.setup();
    const remove = vi.fn(async () => ({}));
    action(remove);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.delete }));
    const dialog = screen.getByRole("dialog", { name: "Delete the enquiry from Omar Haddad?" });
    expect(dialog).toHaveTextContent("It goes for good.");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.keep }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
  });

  it("deletes once confirmed, closes, and goes on; a failure says so in the dialog", async () => {
    const user = userEvent.setup();
    const remove = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new ApiError(404, "RECORD_NOT_FOUND", "This item no longer exists."))
      .mockResolvedValueOnce({ deleted: true });
    const afterwards = action(remove);
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.delete }));
    const confirm = () => screen.getAllByRole("button", { name: ADMIN_TEXT.delete }).at(-1)!;
    await user.click(confirm());
    expect(await screen.findByText("This item no longer exists.")).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.notDeleted)).toBeVisible();
    expect(afterwards).not.toHaveBeenCalled();

    await user.click(confirm());
    await waitFor(() => expect(afterwards).toHaveBeenCalledOnce());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(remove).toHaveBeenCalledTimes(2);

    // Asked again, the last failure is gone.
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.delete }));
    expect(screen.queryByText(ADMIN_TEXT.notDeleted)).not.toBeInTheDocument();
  });

  it("goes on with nothing more to do when nothing follows", async () => {
    const user = userEvent.setup();
    render(<DeleteAction title="Delete?" body="Gone." remove={async () => ({})} revalidate={[]} />, {
      wrapper: WithSWR,
    });
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.delete }));
    await user.click(screen.getAllByRole("button", { name: ADMIN_TEXT.delete }).at(-1)!);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
