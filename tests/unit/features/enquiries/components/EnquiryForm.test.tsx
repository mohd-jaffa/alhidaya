import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { ERROR_MESSAGES, UI_TEXT, VALIDATION_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { EnquiryForm } from "@/features/enquiries/components/EnquiryForm";
import { ApiError } from "@/lib/api/client";

const schema = async () =>
  z.object({
    name: z.string().min(1, "Name is required."),
    consent: z.literal(true, { error: VALIDATION_MESSAGES.consent }),
  });

function Form({
  send = async () => {},
  whatsapp = "+97431306555",
}: {
  send?: (values: Record<string, unknown>) => Promise<unknown>;
  whatsapp?: string | null;
}) {
  return (
    <EnquiryForm schema={schema} send={send} action="Send it" sent="Thanks." notSent="Not sent." whatsapp={whatsapp}>
      {(errors) => (
        <label>
          Name <input name="name" aria-describedby="name-error" />
          <span id="name-error">{errors.name}</span>
        </label>
      )}
    </EnquiryForm>
  );
}

async function sendFilled(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: /Name/ }), "Mariam");
  await user.click(screen.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) }));
  await user.click(screen.getByRole("button", { name: "Send it" }));
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("EnquiryForm", () => {
  it("asks for consent beside a privacy notice that opens apart, so nothing typed is lost", async () => {
    const user = userEvent.setup();
    render(<Form />);
    const privacy = screen.getByRole("link", { name: UI_TEXT.privacyNotice });
    expect(privacy).toHaveAttribute("href", ROUTES.privacy);
    expect(privacy).toHaveAttribute("target", "_blank");
    await user.click(screen.getByRole("button", { name: "Send it" }));
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: new RegExp(UI_TEXT.consent) })).toHaveAccessibleDescription(
        VALIDATION_MESSAGES.consent,
      ),
    );
  });

  it("says it is sending, then gives way to the thanks, which takes focus, with WhatsApp to follow up", async () => {
    const user = userEvent.setup();
    let finish = () => {};
    render(<Form send={() => new Promise<void>((resolve) => (finish = resolve))} />);
    await sendFilled(user);
    const sending = await screen.findByRole("button", { name: UI_TEXT.sending });
    expect(sending).toHaveAttribute("aria-busy", "true");
    finish();

    const thanks = await screen.findByRole("group", { name: "Thanks." });
    expect(thanks).toHaveFocus();
    expect(thanks).toHaveTextContent(`${UI_TEXT.sentNext} ${UI_TEXT.fasterOnWhatsApp}`);
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/97431306555"),
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(screen.queryByRole("button", { name: "Send it" })).not.toBeInTheDocument();
  });

  it("thanks without WhatsApp when the site has no number to give", async () => {
    const user = userEvent.setup();
    render(<Form whatsapp={null} />);
    await sendFilled(user);
    const thanks = await screen.findByRole("group", { name: "Thanks." });
    expect(thanks).toHaveTextContent(UI_TEXT.sentNext);
    expect(thanks).not.toHaveTextContent(UI_TEXT.fasterOnWhatsApp);
    expect(screen.queryByRole("link", { name: UI_TEXT.whatsapp })).not.toBeInTheDocument();
  });

  it("says why it was not sent, with the reference when there is one, keeping what was typed", async () => {
    const user = userEvent.setup();
    const failures = [
      new ApiError(429, "RATE_LIMITED", ERROR_MESSAGES.RATE_LIMITED, "req_1"),
      new ApiError(0, "NETWORK_OFFLINE", ERROR_MESSAGES.NETWORK_OFFLINE),
    ];
    render(
      <Form
        send={async () => {
          throw failures.shift();
        }}
      />,
    );
    await sendFilled(user);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Not sent.");
    expect(alert).toHaveTextContent(`${ERROR_MESSAGES.RATE_LIMITED} ${UI_TEXT.nothingLost}`);
    expect(alert).toHaveTextContent(`${UI_TEXT.errorReference}: req_1`);
    expect(screen.getByRole("textbox", { name: /Name/ })).toHaveValue("Mariam");

    await user.click(screen.getByRole("button", { name: "Send it" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(ERROR_MESSAGES.NETWORK_OFFLINE));
    expect(screen.getByRole("alert")).not.toHaveTextContent(UI_TEXT.errorReference);
  });
});
