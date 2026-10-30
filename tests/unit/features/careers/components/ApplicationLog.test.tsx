import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { API_ROUTES } from "@/constants/routes";
import { ApplicationLog } from "@/features/careers/components/ApplicationLog";
import type { ApplicationListItem } from "@/features/careers/types";
import { stubApi, WithSWR } from "@tests/support/api";

vi.mock("@/features/careers/components/ApplicationOpened", () => ({
  ApplicationOpened: ({ id }: { id: string }) => <p>Opened {id}</p>,
}));

afterEach(() => vi.unstubAllGlobals());

const item = (id: string, name: string): ApplicationListItem => ({
  id,
  jobId: null,
  jobTitle: null,
  status: "NEW",
  emailStatus: "SENT",
  cvStatus: "STORED",
  name,
  email: "a@example.com",
  phone: "+97455512345",
  createdAt: "2026-10-30T08:01:00Z",
});

const EMPTY = { title: "Nothing here", body: "It arrives here." };
const list = { items: [item("a-2", "Omar Haddad")], total: 1, page: 1, pageSize: 25, jobs: [] };

const log = (initiallyOpen: string | null = null) =>
  render(
    <ApplicationLog
      query={{ job: "general" }}
      pageBase="/admin/applications"
      empty={EMPTY}
      initiallyOpen={initiallyOpen}
    />,
    { wrapper: WithSWR },
  );

describe("ApplicationLog", () => {
  it("lists the applications its query asks for, each as a row", async () => {
    const fetch = stubApi(() => ({ data: list }));
    log();
    expect(await screen.findByRole("button", { name: /Application from Omar Haddad/ })).toBeVisible();
    expect(fetch).toHaveBeenCalledWith(`${API_ROUTES.adminApplications}?job=general`, expect.anything());
  });

  it("opens the application an address named above the list when it is not on this page", async () => {
    stubApi((_, url) =>
      url === API_ROUTES.adminApplication("a-1")
        ? {
            data: {
              ...item("a-1", "Mariam Ali"),
              emailStatus: "NOT_SENT",
              status: "SHORTLISTED",
              fields: [],
              notes: [],
            },
          }
        : { data: list },
    );
    log("a-1");
    const named = await screen.findByRole("article", { name: ADMIN_TEXT.applicationFrom("Mariam Ali") });
    expect(named).toHaveTextContent("30 October 2026 at 11:01");
    expect(named).toHaveTextContent(ADMIN_TEXT.hrEmailNotSent);
    expect(named).toHaveTextContent("Shortlisted");
    expect(named).toHaveTextContent("Opened a-1");
  });

  it("says when the named application did not load", async () => {
    stubApi((_, url) =>
      url === API_ROUTES.adminApplication("a-1")
        ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } }
        : { data: list },
    );
    log("a-1");
    expect(await screen.findByRole("alert")).toHaveTextContent(ERROR_MESSAGES.RECORD_NOT_FOUND);
  });
});
