import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ApplicationOpened } from "@/features/careers/components/ApplicationOpened";
import type { ApplicationOpened as Opened } from "@/features/careers/types";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

const navigation = vi.hoisted(() => ({ pathname: "/admin", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
  navigation.pathname = "/admin";
  navigation.replace.mockClear();
});

const LONG = "Six years in intensive care in Manila, and two in home care in Doha; I can start in March.";

const application = (overrides: Partial<Opened> = {}): Opened => ({
  id: "a-1",
  jobId: "j-1",
  jobTitle: "Registered General Nurse – Home Care",
  status: "NEW",
  emailStatus: "SENT",
  cvStatus: "STORED",
  name: "Mariam Ali",
  email: "mariam@example.com",
  phone: "+97455512345",
  fields: [
    { label: "Your MOPH licence", value: "In progress" },
    { label: "Years of nursing experience", value: "4" },
    { label: "Anything else we should know", value: LONG },
  ],
  cvName: "Mariam CV.pdf",
  cvType: "pdf",
  cvBytes: 245_760,
  notes: [],
  createdAt: "2026-10-30T08:01:00Z",
  updatedAt: "2026-10-30T08:01:00Z",
  ...overrides,
});

/** The application's endpoint, and whatever a write to it answers. */
function api(opened: Opened, write: (method: string, url: string, body: unknown) => Answer = () => ({ data: {} })) {
  return stubApi((method, url, body) =>
    method === "GET" && url === ADMIN_API_ROUTES.adminApplication(opened.id)
      ? { data: opened }
      : write(method, url, body),
  );
}

const open = () => render(<ApplicationOpened id="a-1" />, { wrapper: WithSWR });

describe("ApplicationOpened", () => {
  it("shows the job and every answer, the ways to answer them, and the CV to download", async () => {
    api(application());
    open();
    expect(await screen.findByText("Registered General Nurse – Home Care")).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.job)).toBeVisible();
    expect(screen.getByText("In progress", { selector: "dd" })).toBeVisible();
    expect(screen.getByText(LONG).parentElement).toHaveClass("sm:col-span-2");
    expect(screen.getByText("4").parentElement).not.toHaveClass("sm:col-span-2");
    expect(screen.getByRole("link", { name: ADMIN_TEXT.call })).toHaveAttribute("href", "tel:+97455512345");
    const cv = screen.getByRole("region", { name: ADMIN_TEXT.cv });
    expect(cv).toHaveTextContent("Mariam CV.pdf · 240 kB");
    const download = within(cv).getByRole("link", { name: ADMIN_TEXT.downloadCv });
    expect(download).toHaveAttribute("href", ADMIN_API_ROUTES.adminApplicationCv("a-1"));
    expect(download).toHaveAttribute("download");
    expect(screen.queryByText(ADMIN_TEXT.hrEmailNotSent)).not.toBeInTheDocument();
  });

  it("says why a CV cannot be downloaded: never kept, expired, or still being saved", async () => {
    for (const [cvStatus, title, body] of [
      ["NOT_STORED", ADMIN_TEXT.cvNotStored, ADMIN_TEXT.cvNotStoredBody],
      ["EXPIRED", ADMIN_TEXT.cvExpired, ADMIN_TEXT.cvExpiredBody],
      ["PENDING", ADMIN_TEXT.cvPending, ADMIN_TEXT.cvPendingBody],
    ] as const) {
      api(application({ cvStatus, jobTitle: null, jobId: null }));
      const { unmount } = open();
      const cv = await screen.findByRole("region", { name: ADMIN_TEXT.cv });
      expect(cv).toHaveTextContent(title);
      expect(cv).toHaveTextContent(body);
      expect(within(cv).queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText(ADMIN_TEXT.generalApplication)).toBeVisible();
      unmount();
    }
  });

  it("moves it along, and sends the HR email again when it did not go", async () => {
    const user = userEvent.setup();
    const fetch = api(application({ emailStatus: "NOT_SENT", status: "IN_REVIEW" }));
    open();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.hrEmailNotSentBody);
    expect(screen.queryByRole("button", { name: "In review" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Shortlisted" }));
    await user.click(within(alert).getByRole("button", { name: ADMIN_TEXT.retryHrEmail }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        ADMIN_API_ROUTES.adminApplicationRetryMail("a-1"),
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminApplication("a-1"),
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "SHORTLISTED" }) }),
    );
  });

  it("adds the team's note", async () => {
    const user = userEvent.setup();
    const fetch = api(application());
    open();
    const notes = await screen.findByRole("region", { name: ADMIN_TEXT.notes });
    await user.type(within(notes).getByRole("textbox", { name: ADMIN_TEXT.addNote }), "Call on Sunday.");
    await user.click(within(notes).getByRole("button", { name: ADMIN_TEXT.saveNote }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        ADMIN_API_ROUTES.adminApplicationNotes("a-1"),
        expect.objectContaining({ body: JSON.stringify({ body: "Call on Sunday." }) }),
      ),
    );
  });

  it("deletes it once asked, and leaves its own page for the inbox (D82)", async () => {
    const user = userEvent.setup();
    const fetch = api(application());
    navigation.pathname = ADMIN_ROUTES.application("a-1");
    open();
    await user.click(await screen.findByRole("button", { name: ADMIN_TEXT.delete }));
    expect(screen.getByRole("dialog", { name: ADMIN_TEXT.deleteApplicationTitle("Mariam Ali") })).toHaveTextContent(
      ADMIN_TEXT.deleteApplicationBody,
    );
    await user.click(screen.getAllByRole("button", { name: ADMIN_TEXT.delete }).at(-1)!);
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(ADMIN_ROUTES.applications));
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminApplication("a-1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deleted from a list, stays where it is", async () => {
    const user = userEvent.setup();
    api(application());
    open();
    await user.click(await screen.findByRole("button", { name: ADMIN_TEXT.delete }));
    await user.click(screen.getAllByRole("button", { name: ADMIN_TEXT.delete }).at(-1)!);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("says when the application did not load, and tries again", async () => {
    const user = userEvent.setup();
    let fail = true;
    stubApi(() =>
      fail
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : { data: application() },
    );
    open();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.loadFailed);
    fail = false;
    await user.click(within(alert).getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText("Registered General Nurse – Home Care")).toBeVisible();
  });
});
