import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DiskMeter, nearlyFull, percentUsed } from "@/components/admin/DiskMeter";
import { ADMIN_TEXT } from "@/constants/admin-messages";

const MB = 1024 * 1024;

describe("DiskMeter (plan §21.2, D95)", () => {
  it("says how full a folder is in words and as a bar, sky while there is room", () => {
    render(<DiskMeter label={ADMIN_TEXT.cvFolder} use={{ bytes: 50 * MB, budget: 250 * MB }} />);
    const meter = screen.getByRole("meter", { name: ADMIN_TEXT.cvFolder });
    expect(meter).toHaveAttribute("aria-valuenow", "20");
    expect(meter.firstElementChild).toHaveClass("bg-sky");
    expect(meter).toHaveAttribute("aria-valuetext", ADMIN_TEXT.diskUsed("50 MB", "250 MB", 20));
    expect(screen.queryByText(ADMIN_TEXT.diskNearlyFull)).toBeNull();
  });

  it("warns past the warning point, the bar never past full", () => {
    expect([
      percentUsed({ bytes: 200 * MB, budget: 250 * MB }),
      nearlyFull({ bytes: 197 * MB, budget: 250 * MB }),
    ]).toEqual([80, false]);
    render(<DiskMeter label={ADMIN_TEXT.mediaFolder} use={{ bytes: 300 * MB, budget: 250 * MB }} />);
    expect(screen.getByText(ADMIN_TEXT.diskNearlyFull)).toBeVisible();
    const meter = screen.getByRole("meter", { name: ADMIN_TEXT.mediaFolder });
    expect(meter).toHaveAttribute("aria-valuenow", "100");
    expect(meter.firstElementChild).toHaveClass("bg-error");
  });
});
