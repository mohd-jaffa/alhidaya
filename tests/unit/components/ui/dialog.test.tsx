import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Dialog } from "@/components/ui/dialog";
import { UI_TEXT } from "@/constants/messages";

// jsdom has no modal dialog; these stand in for the browser's own.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

describe("Dialog", () => {
  it("opens as the browser's modal, named by its title, and closes from its button", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog open={false} onClose={onClose} title="Before you send">
        <p>We reply as soon as we can.</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Dialog open onClose={onClose} title="Before you send">
        <p>We reply as soon as we can.</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", { name: "Before you send" })).toHaveTextContent("We reply as soon as we can.");
    rerender(
      <Dialog open onClose={onClose} title="Before you send">
        <p>We reply as soon as we can.</p>
      </Dialog>,
    );

    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.close }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when its owner says so", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog open onClose={onClose} title="Before you send">
        <p>Text</p>
      </Dialog>,
    );
    rerender(
      <Dialog open={false} onClose={onClose} title="Before you send">
        <p>Text</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
