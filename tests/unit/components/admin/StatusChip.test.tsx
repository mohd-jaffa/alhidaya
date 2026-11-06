import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusChip } from "@/components/admin/StatusChip";

describe("StatusChip", () => {
  it("says where something stands in words, its colour only beside them", () => {
    render(
      <>
        <StatusChip tone="new">New</StatusChip>
        <StatusChip tone="progress">In progress</StatusChip>
        <StatusChip tone="done">Resolved</StatusChip>
        <StatusChip tone="error">Alert email not sent</StatusChip>
        <StatusChip tone="off">Archived</StatusChip>
      </>,
    );
    expect(screen.getByText("New")).toHaveClass("text-status-new");
    expect(screen.getByText("Alert email not sent")).toHaveClass("text-error");
    expect(screen.getByText("Resolved").querySelector("[aria-hidden]")).toHaveClass("bg-leaf");
    expect(screen.getByText("In progress").querySelector("[aria-hidden]")).toHaveClass("bg-sky");
    expect(screen.getByText("Archived")).toHaveClass("text-ink-2");
  });
});
