import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AskedAction } from "@/components/admin/AskedAction";
import { ApiError } from "@/lib/api/client";
import { stubDialogs, WithSWR } from "@tests/support/api";

beforeAll(stubDialogs);

const action = (act: () => Promise<string>, afterwards = vi.fn(), primary = false) => {
  render(
    <AskedAction
      label="Archive"
      pendingLabel="Archiving"
      title="Archive Elderly care?"
      body="It is taken off the website."
      keep="Not yet"
      failed="It was not archived."
      act={act}
      afterwards={afterwards}
      primary={primary}
    />,
    { wrapper: WithSWR },
  );
  return afterwards;
};

describe("AskedAction (plan §16)", () => {
  it("asks first, and the way out leaves everything as it was", async () => {
    const act = vi.fn(async () => "done");
    action(act);
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(screen.getByRole("dialog", { name: "Archive Elderly care?" })).toHaveTextContent(
      "It is taken off the website.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Not yet" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(act).not.toHaveBeenCalled();
  });

  it("does it once asked, says so while it works, and hands on the answer", async () => {
    let finish: (value: string) => void = () => {};
    const afterwards = action(() => new Promise((resolve) => (finish = resolve)), vi.fn(), true);
    expect(screen.getByRole("button", { name: "Archive" })).toHaveClass("bg-deep");
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    await userEvent.click(screen.getAllByRole("button", { name: "Archive" })[1]);
    expect(await screen.findByRole("button", { name: "Archiving" })).toHaveAttribute("aria-busy", "true");
    finish("done");
    await waitFor(() => expect(afterwards).toHaveBeenCalledWith("done"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("says in the dialog when it failed, and asks afresh the next time", async () => {
    const act = vi.fn(async () => {
      throw new ApiError(422, "NOTHING_PUBLISHED", "There is no published version to go back to yet.");
    });
    const afterwards = action(act);
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    await userEvent.click(screen.getAllByRole("button", { name: "Archive" })[1]);
    expect(await screen.findByText("It was not archived.")).toBeVisible();
    expect(afterwards).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Not yet" }));
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(screen.queryByText("It was not archived.")).toBeNull();
  });
});
