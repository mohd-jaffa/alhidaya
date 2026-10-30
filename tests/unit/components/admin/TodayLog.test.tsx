import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TodayLog } from "@/components/admin/TodayLog";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { stubApi, WithSWR } from "@tests/support/api";

vi.mock("@/features/enquiries/components/EnquiryOpened", () => ({ EnquiryOpened: () => null }));
vi.mock("@/features/careers/components/ApplicationOpened", () => ({ ApplicationOpened: () => null }));

afterEach(() => vi.unstubAllGlobals());

const person = { email: "a@example.com", phone: "+97455512345", emailStatus: "SENT", status: "NEW" };

describe("TodayLog", () => {
  it("shows enquiries and applications in one stream, each as its own inbox shows it", async () => {
    stubApi(() => ({
      data: {
        items: [
          {
            kind: "application",
            id: "a-1",
            name: "Mariam Ali",
            jobTitle: "Registered General Nurse – Home Care",
            jobId: "j-1",
            cvStatus: "STORED",
            createdAt: "2026-10-30T08:05:00Z",
            ...person,
          },
          {
            kind: "enquiry",
            id: "e-1",
            form: "CONTACT",
            name: "Omar Haddad",
            summary: "A nurse at night?",
            createdAt: "2026-10-30T08:01:00Z",
            ...person,
          },
        ],
        total: 2,
        page: 1,
        pageSize: 25,
      },
    }));
    render(
      <TodayLog
        listKey={`${ADMIN_API_ROUTES.adminToday}?needsYou=true`}
        pageBase="/admin"
        empty={{ title: "", body: "" }}
      />,
      {
        wrapper: WithSWR,
      },
    );
    const rows = await screen.findAllByRole("button", { expanded: false });
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("Application from Mariam Ali"),
      expect.stringContaining("Message from Omar Haddad"),
    ]);
  });
});
