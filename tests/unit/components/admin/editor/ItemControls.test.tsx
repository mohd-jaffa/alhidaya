import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ItemControls } from "@/components/admin/editor/ItemControls";

const named = (action: string) => screen.getByRole("button", { name: ADMIN_TEXT.actionOn(action, "Value 2") });

describe("ItemControls", () => {
  it("moves an item up or down one place, and removes it, each naming what it acts on", async () => {
    const onMove = vi.fn();
    const onRemove = vi.fn();
    render(<ItemControls thing="Value 2" index={1} count={3} onMove={onMove} onRemove={onRemove} />);
    await userEvent.click(named(ADMIN_TEXT.moveUp));
    await userEvent.click(named(ADMIN_TEXT.moveDown));
    await userEvent.click(named(ADMIN_TEXT.remove));
    expect(onMove.mock.calls).toEqual([[0], [2]]);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("says so when an item can go no higher, no lower, or must stay", async () => {
    const onMove = vi.fn();
    const onRemove = vi.fn();
    render(
      <ItemControls
        thing="Value 2"
        index={1}
        count={2}
        first={1}
        canRemove={false}
        onMove={onMove}
        onRemove={onRemove}
      />,
    );
    for (const action of [ADMIN_TEXT.moveUp, ADMIN_TEXT.moveDown, ADMIN_TEXT.remove]) {
      expect(named(action)).toHaveAttribute("aria-disabled", "true");
      await userEvent.click(named(action));
    }
    expect(onMove).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("offers only the moves for a list nothing is removed from (D92)", async () => {
    const onMove = vi.fn();
    render(<ItemControls thing="Value 2" index={1} count={3} onMove={onMove} />);
    expect(screen.queryByRole("button", { name: ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, "Value 2") })).toBeNull();
    await userEvent.click(named(ADMIN_TEXT.moveDown));
    expect(onMove).toHaveBeenCalledWith(2);
  });
});
