import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { EnquiryOpened } from "@/features/enquiries/components/EnquiryOpened";
import type { EnquiryOpened as Opened } from "@/features/enquiries/types";
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

const LONG = "We need two school nurses from January, full time, for a primary school of 600 pupils.";

const enquiry = (overrides: Partial<Opened> = {}): Opened => ({
  id: "e-1",
  form: "QUOTE",
  status: "NEW",
  emailStatus: "SENT",
  name: "Omar Haddad",
  email: "omar@school.qa",
  phone: "+97455512345",
  fields: [
    { label: "Who is the care for?", value: "A school" },
    { label: "Message", value: LONG },
  ],
  notes: [],
  createdAt: "2026-10-29T08:01:00Z",
  updatedAt: "2026-10-29T08:01:00Z",
  ...overrides,
});

/** The enquiry's endpoint, and whatever a write to it answers. */
function api(opened: Opened, write: (method: string, url: string, body: unknown) => Answer = () => ({ data: {} })) {
  return stubApi((method, url, body) =>
    method === "GET" && url === ADMIN_API_ROUTES.adminEnquiry(opened.id) ? { data: opened } : write(method, url, body),
  );
}

const open = () => render(<EnquiryOpened id="e-1" />, { wrapper: WithSWR });

describe("EnquiryOpened", () => {
  it("shows every answer as the visitor gave it, and the ways to answer them", async () => {
    api(enquiry());
    open();
    expect(screen.getByText("", { selector: "[aria-busy]" })).toBeInTheDocument();
    expect(await screen.findByText(LONG)).toBeVisible();
    expect(screen.getByText(LONG).parentElement).toHaveClass("sm:col-span-2");
    expect(screen.getByText("A school").parentElement).not.toHaveClass("sm:col-span-2");
    expect(screen.getByRole("link", { name: ADMIN_TEXT.call })).toHaveAttribute("href", "tel:+97455512345");
    expect(screen.getByRole("link", { name: ADMIN_TEXT.whatsapp })).toHaveAttribute(
      "href",
      "https://wa.me/97455512345",
    );
    expect(screen.getByRole("link", { name: ADMIN_TEXT.emailAction })).toHaveAttribute("href", "mailto:omar@school.qa");
    expect(screen.queryByText(ADMIN_TEXT.alertNotSent)).not.toBeInTheDocument();
  });

  it("moves it along to either other status, and says when it could not", async () => {
    const user = userEvent.setup();
    let refuse = false;
    const fetch = api(enquiry({ status: "IN_PROGRESS" }), (): Answer =>
      refuse ? { status: 404, error: { code: "RECORD_NOT_FOUND", message: ERROR_MESSAGES.RECORD_NOT_FOUND } } : {},
    );
    open();
    await screen.findByText(LONG);
    expect(screen.queryByRole("button", { name: "In progress" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resolved" }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        ADMIN_API_ROUTES.adminEnquiry("e-1"),
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "RESOLVED" }) }),
      ),
    );
    refuse = true;
    await user.click(screen.getByRole("button", { name: "New" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.statusNotChanged);
    expect(alert).toHaveTextContent(ERROR_MESSAGES.RECORD_NOT_FOUND);
    refuse = false;
    await user.click(screen.getByRole("button", { name: "Resolved" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("offers to send an alert again that did not go, and says if it still did not", async () => {
    const user = userEvent.setup();
    const fetch = api(enquiry({ emailStatus: "NOT_SENT" }), () => ({
      status: 502,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR },
    }));
    open();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.alertNotSentBody);
    await user.click(within(alert).getByRole("button", { name: ADMIN_TEXT.retryAlert }));
    await waitFor(() => expect(alert).toHaveTextContent(ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR));
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminEnquiryRetryMail("e-1"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("keeps the team's notes, oldest first, each by its admin and when", async () => {
    api(
      enquiry({
        notes: [
          { id: "n-1", body: "Called back;\nno answer.", author: "Fatima", createdAt: "2026-10-29T09:00:00Z" },
          { id: "n-2", body: "Visit Sunday.", author: null, createdAt: "2026-10-29T10:30:00Z" },
        ],
      }),
    );
    open();
    const notes = await screen.findByRole("region", { name: ADMIN_TEXT.notes });
    const items = within(notes).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(ADMIN_TEXT.noteBy("Fatima", "29 October 2026 at 12:00"));
    expect(items[1]).toHaveTextContent("29 October 2026 at 13:30");
    expect(items[1]).not.toHaveTextContent(",");
  });

  it("adds a note, clearing the box once it is kept, and keeps what was typed when it is not", async () => {
    const user = userEvent.setup();
    let refuse = false;
    const fetch = api(enquiry(), (): Answer =>
      refuse ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } } : {},
    );
    open();
    const notes = await screen.findByRole("region", { name: ADMIN_TEXT.notes });
    expect(notes).toHaveTextContent(ADMIN_TEXT.noNotes);
    const box = within(notes).getByRole("textbox", { name: ADMIN_TEXT.addNote });
    await user.click(within(notes).getByRole("button", { name: ADMIN_TEXT.saveNote }));
    await waitFor(() => expect(box).toHaveAccessibleDescription(VALIDATION_MESSAGES.required("Note")));

    await user.type(box, "Called back.");
    await user.click(within(notes).getByRole("button", { name: ADMIN_TEXT.saveNote }));
    await waitFor(() => expect(box).toHaveValue(""));
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminEnquiryNotes("e-1"),
      expect.objectContaining({ body: JSON.stringify({ body: "Called back." }) }),
    );

    refuse = true;
    await user.type(box, "Second note.");
    await user.click(within(notes).getByRole("button", { name: ADMIN_TEXT.saveNote }));
    const alert = await within(notes).findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.noteNotSaved);
    expect(box).toHaveValue("Second note.");
    refuse = false;
    await user.click(within(notes).getByRole("button", { name: ADMIN_TEXT.saveNote }));
    await waitFor(() => expect(within(notes).queryByRole("alert")).not.toBeInTheDocument());
  });

  it("deletes it once asked, and leaves its own page for the inbox (D82)", async () => {
    const user = userEvent.setup();
    const fetch = api(enquiry());
    navigation.pathname = ADMIN_ROUTES.enquiry("e-1");
    open();
    await user.click(await screen.findByRole("button", { name: ADMIN_TEXT.delete }));
    expect(screen.getByRole("dialog", { name: ADMIN_TEXT.deleteEnquiryTitle("Omar Haddad") })).toHaveTextContent(
      ADMIN_TEXT.deleteEnquiryBody,
    );
    await user.click(screen.getAllByRole("button", { name: ADMIN_TEXT.delete }).at(-1)!);
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(ADMIN_ROUTES.enquiries));
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminEnquiry("e-1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("deleted from a list, stays where it is", async () => {
    const user = userEvent.setup();
    api(enquiry());
    open();
    await user.click(await screen.findByRole("button", { name: ADMIN_TEXT.delete }));
    await user.click(screen.getAllByRole("button", { name: ADMIN_TEXT.delete }).at(-1)!);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("says when the enquiry did not load, and tries again", async () => {
    const user = userEvent.setup();
    let fail = true;
    stubApi(() =>
      fail
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : { data: enquiry() },
    );
    open();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.loadFailed);
    fail = false;
    await user.click(within(alert).getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByText(LONG)).toBeVisible();
  });
});
