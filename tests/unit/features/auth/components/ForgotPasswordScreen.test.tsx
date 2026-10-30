import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_RESET_MINUTES } from "@/constants/limits";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { ForgotPasswordScreen } from "@/features/auth/components/ForgotPasswordScreen";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => vi.unstubAllGlobals());

const email = () => screen.getByRole("textbox", { name: ADMIN_TEXT.email });

describe("ForgotPasswordScreen", () => {
  it("sends the link and says the same whoever's email it is, with the way back", async () => {
    const user = userEvent.setup();
    stubApi(() => ({ data: { requested: true } }));
    render(<ForgotPasswordScreen />, { wrapper: WithSWR });
    expect(screen.getByRole("link", { name: ADMIN_TEXT.backToSignIn })).toHaveAttribute("href", ADMIN_ROUTES.login);
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.sendLink }));
    expect(await screen.findByText(VALIDATION_MESSAGES.required("Email"))).toBeVisible();
    await user.type(email(), "someone@example.com");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.sendLink }));
    const sent = await screen.findByRole("status");
    expect(sent).toHaveTextContent(ADMIN_TEXT.linkSentBody(PASSWORD_RESET_MINUTES));
  });

  it("says when the link was not sent, and keeps the email to try again", async () => {
    const user = userEvent.setup();
    stubApi(() => ({ status: 429, error: { code: "RATE_LIMITED", message: ERROR_MESSAGES.RATE_LIMITED } }));
    render(<ForgotPasswordScreen />, { wrapper: WithSWR });
    await user.type(email(), "admin@alhidaya.qa");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.sendLink }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.linkNotSent);
    expect(alert).toHaveTextContent(ERROR_MESSAGES.RATE_LIMITED);
    expect(email()).toHaveValue("admin@alhidaya.qa");
  });

  it("says it is sending while the server answers", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<ForgotPasswordScreen />, { wrapper: WithSWR });
    await user.type(email(), "admin@alhidaya.qa");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.sendLink }));
    expect(await screen.findByRole("button", { name: ADMIN_TEXT.sending })).toHaveAttribute("aria-busy", "true");
  });
});
