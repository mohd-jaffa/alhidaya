import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { QuoteForm } from "@/features/enquiries/components/QuoteForm";

const { submit } = vi.hoisted(() => ({ submit: vi.fn(async () => ({ received: true })) }));
vi.mock("@/features/enquiries/api.client", () => ({ EnquiriesClient: { submit } }));

const SERVICES = [
  { slug: "home-nursing-care", name: "Home nursing care" },
  { slug: "school-nurse-staffing", name: "School nurse staffing" },
];
const field = (label: string) => screen.getByRole("textbox", { name: label });

describe("QuoteForm (plan §10.1)", () => {
  it("offers the published services, starting on the one the visitor came from", () => {
    render(<QuoteForm services={SERVICES} chosen="school-nurse-staffing" whatsapp={null} />);
    const service = screen.getByRole("combobox", { name: `${UI_TEXT.service} (${UI_TEXT.optional})` });
    expect(service).toHaveValue("school-nurse-staffing");
    expect(service).toHaveAccessibleDescription(UI_TEXT.serviceHint);
    expect([...service.querySelectorAll("option")].map((option) => option.textContent)).toEqual([
      UI_TEXT.serviceNotSure,
      "Home nursing care",
      "School nurse staffing",
    ]);
  });

  it("asks who the care is for and how to reach the visitor", async () => {
    const user = userEvent.setup();
    render(<QuoteForm services={SERVICES} chosen="" whatsapp={null} />);
    expect(screen.getByRole("group", { name: UI_TEXT.careFor })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(8);
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendQuote }));
    expect(await screen.findByText(VALIDATION_MESSAGES.careFor)).toBeVisible();
    expect(screen.getByText(VALIDATION_MESSAGES.contactMethod)).toBeVisible();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("sends the request as a Quote enquiry, as typed", async () => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    render(<QuoteForm services={SERVICES} chosen="" whatsapp="+97431306555" />);
    await user.type(field(UI_TEXT.yourName), "Omar Haddad");
    await user.click(screen.getByRole("radio", { name: "A school" }));
    await user.selectOptions(screen.getByRole("combobox"), "school-nurse-staffing");
    await user.type(field(UI_TEXT.phone), "+44 20 7946 0958");
    await user.type(field(UI_TEXT.email), "omar@example.com");
    await user.click(screen.getByRole("radio", { name: "Email" }));
    await user.type(field(UI_TEXT.message), "Two school nurses.");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: UI_TEXT.sendQuote }));
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith("QUOTE", {
        name: "Omar Haddad",
        organisation: "",
        careFor: "SCHOOL",
        service: "school-nurse-staffing",
        phone: "+44 20 7946 0958",
        email: "omar@example.com",
        contactMethod: "EMAIL",
        message: "Two school nurses.",
        consent: true,
      }),
    );
    expect(await screen.findByRole("group", { name: UI_TEXT.quoteSent })).toBeInTheDocument();
  });
});
