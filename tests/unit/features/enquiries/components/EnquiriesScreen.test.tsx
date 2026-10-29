import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/routes";
import { EnquiriesScreen } from "@/features/enquiries/components/EnquiriesScreen";

const log = vi.hoisted(() => vi.fn());
vi.mock("@/features/enquiries/components/EnquiryLog", () => ({
  EnquiryLog: (props: unknown) => {
    log(props);
    return null;
  },
}));

describe("EnquiriesScreen", () => {
  it("lists every enquiry by default, with the statuses and forms to narrow it and a search", () => {
    render(<EnquiriesScreen searchParams={{}} />);
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.enquiries })).toBeVisible();
    const statuses = screen.getByRole("navigation", { name: ADMIN_TEXT.enquiries });
    expect(within(statuses).getByRole("link", { name: ADMIN_TEXT.allStatuses })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(statuses).getByRole("link", { name: "In progress" })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.enquiries}?status=IN_PROGRESS`,
    );
    const forms = screen.getByRole("navigation", { name: ADMIN_TEXT.allForms });
    expect(within(forms).getByRole("link", { name: ADMIN_TEXT.quoteRequests })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.enquiries}?form=QUOTE`,
    );
    const search = screen.getByRole("search");
    expect(search).toHaveAttribute("action", ADMIN_ROUTES.enquiries);
    expect(within(search).getByRole("searchbox", { name: ADMIN_TEXT.search })).toHaveValue("");
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: { status: undefined, form: undefined, q: undefined, page: 1 },
        pageBase: ADMIN_ROUTES.enquiries,
        initiallyOpen: null,
        empty: { title: ADMIN_TEXT.everythingEmpty, body: ADMIN_TEXT.everythingEmptyBody },
      }),
    );
  });

  it("keeps the other filters when one changes, carries them through a search, and opens a named enquiry", () => {
    render(<EnquiriesScreen searchParams={{ status: "NEW", form: "CONTACT", q: " Mariam ", page: "2" }} open="e-1" />);
    const statuses = screen.getByRole("navigation", { name: ADMIN_TEXT.enquiries });
    expect(within(statuses).getByRole("link", { name: "New" })).toHaveAttribute("aria-current", "page");
    expect(within(statuses).getByRole("link", { name: "Resolved" })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.enquiries}?status=RESOLVED&form=CONTACT&q=Mariam`,
    );
    const forms = screen.getByRole("navigation", { name: ADMIN_TEXT.allForms });
    expect(within(forms).getByRole("link", { name: ADMIN_TEXT.messages })).toHaveAttribute("aria-current", "page");
    expect(within(forms).getByRole("link", { name: ADMIN_TEXT.allForms })).toHaveAttribute(
      "href",
      `${ADMIN_ROUTES.enquiries}?status=NEW&q=Mariam`,
    );
    const search = screen.getByRole("search");
    expect(
      [...search.querySelectorAll("input[type=hidden]")].map((input) => [
        input.getAttribute("name"),
        input.getAttribute("value"),
      ]),
    ).toEqual([
      ["status", "NEW"],
      ["form", "CONTACT"],
    ]);
    expect(within(search).getByRole("searchbox")).toHaveValue("Mariam");
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: { status: "NEW", form: "CONTACT", q: "Mariam", page: 2 },
        pageBase: `${ADMIN_ROUTES.enquiries}?status=NEW&form=CONTACT&q=Mariam`,
        initiallyOpen: "e-1",
        empty: { title: ADMIN_TEXT.nothingFound, body: ADMIN_TEXT.nothingFoundBody },
      }),
    );
  });

  it("ignores filters the inbox does not know", () => {
    render(<EnquiriesScreen searchParams={{ status: "ARCHIVED", form: ["QUOTE", "CONTACT"], q: ["a", "b"] }} />);
    expect(log).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: { status: undefined, form: undefined, q: undefined, page: 1 } }),
    );
  });
});
