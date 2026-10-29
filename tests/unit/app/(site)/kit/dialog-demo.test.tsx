import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { DialogDemo } from "@/app/(site)/kit/dialog-demo";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

describe("DialogDemo", () => {
  it("opens the dialog from its button and closes it again", async () => {
    render(<DialogDemo label="Open a dialog" title="Before you send" body="We reply as soon as we can." />);
    await userEvent.click(screen.getByRole("button", { name: "Open a dialog" }));
    expect(screen.getByRole("dialog", { name: "Before you send" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
