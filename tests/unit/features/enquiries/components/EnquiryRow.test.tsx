import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { EnquiryRow } from "@/features/enquiries/components/EnquiryRow";
import type { EnquiryListItem } from "@/features/enquiries/types";

vi.mock("@/features/enquiries/components/EnquiryOpened", () => ({
  EnquiryOpened: ({ id }: { id: string }) => <p>Opened {id}</p>,
}));

const item = (overrides: Partial<EnquiryListItem> = {}): EnquiryListItem => ({
  id: "e-1",
  form: "QUOTE",
  status: "NEW",
  emailStatus: "SENT",
  name: "Omar Haddad",
  email: "omar@school.qa",
  phone: "+97455512345",
  summary: "School nurse staffing · Doha Primary School",
  createdAt: "2026-10-29T08:01:00.000Z",
  ...overrides,
});

describe("EnquiryRow", () => {
  it("says when, who sent what, its line and where it stands; pressed, it opens in place", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(<EnquiryRow item={item()} open={false} onToggle={onToggle} />);
    const row = screen.getByRole("button", { name: /Quote request from Omar Haddad/ });
    expect(row).toHaveAttribute("aria-expanded", "false");
    expect(row).toHaveTextContent("11:01");
    expect(row).toHaveTextContent("School nurse staffing · Doha Primary School");
    expect(row).toHaveTextContent("New");
    expect(screen.queryByText(/Opened/)).not.toBeInTheDocument();
    await user.click(row);
    expect(onToggle).toHaveBeenCalled();

    rerender(<EnquiryRow item={item()} open onToggle={onToggle} />);
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById(row.getAttribute("aria-controls") as string)).toHaveTextContent("Opened e-1");
  });

  it("names a message as a message, marks an alert not sent, and leaves out an empty line", () => {
    render(
      <EnquiryRow
        item={item({ form: "CONTACT", status: "RESOLVED", emailStatus: "NOT_SENT", summary: "" })}
        open={false}
        onToggle={() => {}}
      />,
    );
    const row = screen.getByRole("button", { name: /Message from Omar Haddad/ });
    expect(row).toHaveTextContent(ADMIN_TEXT.alertNotSent);
    expect(row).toHaveTextContent("Resolved");
    expect(row.querySelectorAll(".truncate")).toHaveLength(0);
  });
});
