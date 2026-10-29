import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SiteError from "@/app/(site)/error";
import { UI_TEXT } from "@/constants/messages";

describe("the error page", () => {
  it("says the page did not load, retries, and gives the reference, never the error's own words", async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("ER_ACCESS_DENIED for alhidaya_app"), { digest: "3141592653" });
    render(<SiteError error={error} reset={reset} />);
    expect(screen.getByRole("heading", { level: 1, name: UI_TEXT.errorHeadline })).toBeInTheDocument();
    expect(screen.getByText("3141592653")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("ER_ACCESS_DENIED");

    await userEvent.click(screen.getByRole("button", { name: UI_TEXT.tryAgain }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("leaves the reference out when there is none", () => {
    render(<SiteError error={new Error("x")} reset={vi.fn()} />);
    expect(screen.queryByText(new RegExp(UI_TEXT.errorReference))).not.toBeInTheDocument();
  });
});
