import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_LENGTH } from "@/constants/limits";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ResetPasswordScreen } from "@/features/auth/components/ResetPasswordScreen";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => vi.unstubAllGlobals());

const password = () => screen.getByLabelText(ADMIN_TEXT.newPassword);

describe("ResetPasswordScreen", () => {
  it("sets the new password with the link's token, then leads to sign in", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(() => ({ data: { reset: true } }));
    render(<ResetPasswordScreen token="one-time" />, { wrapper: WithSWR });
    expect(password()).toHaveAccessibleDescription(ADMIN_TEXT.resetHint(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max));
    await user.type(password(), "short");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(
      await screen.findByText(VALIDATION_MESSAGES.passwordLength(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max)),
    ).toBeVisible();

    await user.clear(password());
    await user.type(password(), "a long new password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await screen.findByRole("heading", { name: ADMIN_TEXT.passwordChanged })).toBeVisible();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.signIn })).toHaveAttribute("href", ADMIN_ROUTES.login);
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.passwordReset,
      expect.objectContaining({ body: JSON.stringify({ token: "one-time", password: "a long new password" }) }),
    );
  });

  it("says when the link is spent, with the way to a new one", async () => {
    const user = userEvent.setup();
    stubApi(() => ({ status: 400, error: { code: "AUTH_RESET_INVALID", message: ERROR_MESSAGES.AUTH_RESET_INVALID } }));
    render(<ResetPasswordScreen token="spent" />, { wrapper: WithSWR });
    await user.type(password(), "a long new password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.passwordNotChanged);
    expect(alert).toHaveTextContent(ERROR_MESSAGES.AUTH_RESET_INVALID);
    expect(screen.getByRole("link", { name: ADMIN_TEXT.askAgain })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.forgotPassword,
    );
  });

  it("asks for the email's link when the page is opened without it", () => {
    render(<ResetPasswordScreen token={null} />, { wrapper: WithSWR });
    expect(screen.getByRole("status")).toHaveTextContent(ADMIN_TEXT.resetLinkMissing);
    expect(screen.queryByLabelText(ADMIN_TEXT.newPassword)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.askAgain })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.forgotPassword,
    );
  });

  it("says it is saving while the server answers", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<ResetPasswordScreen token="one-time" />, { wrapper: WithSWR });
    await user.type(password(), "a long new password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await screen.findByRole("button", { name: ADMIN_TEXT.saving })).toHaveAttribute("aria-busy", "true");
  });
});
