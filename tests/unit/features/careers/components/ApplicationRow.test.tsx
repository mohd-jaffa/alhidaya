import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ApplicationRow } from "@/features/careers/components/ApplicationRow";
import type { ApplicationListItem } from "@/features/careers/types";

vi.mock("@/features/careers/components/ApplicationOpened", () => ({
  ApplicationOpened: ({ id }: { id: string }) => <p>Opened {id}</p>,
}));

const item = (overrides: Partial<ApplicationListItem> = {}): ApplicationListItem => ({
  id: "a-1",
  jobId: "j-1",
  jobTitle: "Registered General Nurse – Home Care",
  status: "NEW",
  emailStatus: "SENT",
  cvStatus: "STORED",
  name: "Mariam Ali",
  email: "mariam@example.com",
  phone: "+97455512345",
  createdAt: "2026-10-30T08:01:00.000Z",
  ...overrides,
});

describe("ApplicationRow", () => {
  it("says when, who applied for which job, and where it stands; pressed, it opens in place", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(<ApplicationRow item={item()} open={false} onToggle={onToggle} />);
    const row = screen.getByRole("button", { name: /Application from Mariam Ali/ });
    expect(row).toHaveAttribute("aria-expanded", "false");
    expect(row).toHaveTextContent("11:01");
    expect(row).toHaveTextContent("Registered General Nurse – Home Care");
    expect(row).toHaveTextContent("New");
    expect(row).not.toHaveTextContent(ADMIN_TEXT.hrEmailNotSent);
    await user.click(row);
    expect(onToggle).toHaveBeenCalled();

    rerender(<ApplicationRow item={item()} open onToggle={onToggle} />);
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(row.getAttribute("aria-controls") as string)).toHaveTextContent("Opened a-1");
  });

  it("names a general application, and marks an HR email not sent and a CV not stored", () => {
    render(
      <ApplicationRow
        item={item({ jobId: null, jobTitle: null, status: "CLOSED", emailStatus: "NOT_SENT", cvStatus: "NOT_STORED" })}
        open={false}
        onToggle={() => {}}
      />,
    );
    const row = screen.getByRole("button", { name: /Application from Mariam Ali/ });
    expect(row).toHaveTextContent(ADMIN_TEXT.generalApplication);
    expect(row).toHaveTextContent(ADMIN_TEXT.hrEmailNotSent);
    expect(row).toHaveTextContent(ADMIN_TEXT.cvNotStored);
    expect(row).toHaveTextContent("Closed");
  });
});
