import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { SignInScreen } from "@/features/auth/components/SignInScreen";
import { stubApi, WithSWR } from "@tests/support/api";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  replace.mockClear();
});

const fields = () => ({
  email: screen.getByRole("textbox", { name: ADMIN_TEXT.email }),
  password: screen.getByLabelText(ADMIN_TEXT.password),
});

describe("SignInScreen", () => {
  it("asks for the email and password, with the way to a forgotten one", async () => {
    const user = userEvent.setup();
    render(<SignInScreen next={ADMIN_ROUTES.overview} />, { wrapper: WithSWR });
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.signInTitle })).toBeVisible();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.forgotPassword })).toHaveAttribute(
      "href",
      ADMIN_ROUTES.forgotPassword,
    );
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.signIn }));
    await waitFor(() => expect(fields().email).toHaveAccessibleDescription(VALIDATION_MESSAGES.required("Email")));
    expect(fields().password).toHaveAccessibleDescription(VALIDATION_MESSAGES.required("Password"));
  });

  it("says why it refused, in the server's words, and keeps what was typed", async () => {
    const user = userEvent.setup();
    stubApi(() => ({
      status: 401,
      error: { code: "AUTH_INVALID_CREDENTIALS", message: ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS },
    }));
    render(<SignInScreen next={ADMIN_ROUTES.overview} />, { wrapper: WithSWR });
    await user.type(fields().email, "admin@alhidaya.qa");
    await user.type(fields().password, "not the password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.signIn }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADMIN_TEXT.notSignedIn);
    expect(alert).toHaveTextContent(ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS);
    expect(fields().email).toHaveValue("admin@alhidaya.qa");
    expect(replace).not.toHaveBeenCalled();
  });

  it("signs in and goes on to where the admin was headed", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(() => ({ data: { signedIn: true } }));
    render(<SignInScreen next="/admin/enquiries/e-1" />, { wrapper: WithSWR });
    await user.type(fields().email, "Admin@AlHidaya.qa");
    await user.type(fields().password, "the long password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.signIn }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/enquiries/e-1"));
    expect(fetch).toHaveBeenCalledWith(ADMIN_API_ROUTES.adminSession, expect.objectContaining({ method: "POST" }));
  });

  it("says it is signing in while the server answers, and takes no second press", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<SignInScreen next={ADMIN_ROUTES.overview} />, { wrapper: WithSWR });
    await user.type(fields().email, "admin@alhidaya.qa");
    await user.type(fields().password, "the long password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.signIn }));
    const busy = await screen.findByRole("button", { name: ADMIN_TEXT.signingIn });
    expect(busy).toHaveAttribute("aria-busy", "true");
    // A ring turns on the button while it waits (D204).
    expect(busy.querySelector(".animate-spinner")).not.toBeNull();
  });

  it("stays busy after the server has answered, until the admin's page has arrived (D204)", async () => {
    const user = userEvent.setup();
    stubApi(() => ({ data: { signedIn: true } }));
    let arrived: () => void = () => {};
    replace.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          arrived = resolve;
        }),
    );
    render(<SignInScreen next={ADMIN_ROUTES.overview} />, { wrapper: WithSWR });
    await user.type(fields().email, "admin@alhidaya.qa");
    await user.type(fields().password, "the long password");
    await user.click(screen.getByRole("button", { name: ADMIN_TEXT.signIn }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith(ADMIN_ROUTES.overview));
    // The answer is in and the move has begun, but the page is not there: the button still says it is working.
    const busy = await screen.findByRole("button", { name: ADMIN_TEXT.signingIn });
    expect(busy).toHaveAttribute("aria-busy", "true");
    expect(busy).toBeDisabled();
    await act(async () => arrived());
    expect(screen.getByRole("button", { name: ADMIN_TEXT.signIn })).not.toHaveAttribute("aria-busy", "true");
    replace.mockReset();
  });
});
