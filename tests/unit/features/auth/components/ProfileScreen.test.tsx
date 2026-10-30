import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES, VALIDATION_MESSAGES } from "@/constants/messages";
import { ProfileScreen } from "@/features/auth/components/ProfileScreen";
import { stubApi, WithSWR } from "@tests/support/api";

const router = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const profile = () =>
  render(<ProfileScreen name="Fatima" email="admin@alhidaya.qa" />, {
    wrapper: WithSWR,
  });
const panel = (name: string) => screen.getByRole("heading", { level: 2, name }).closest("section")!;

describe("ProfileScreen (D115)", () => {
  it("shows the account, renames the admin, and greets them by the new name", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(() => ({ data: { name: "Fatima Ali", email: "admin@alhidaya.qa" } }));
    profile();
    expect(screen.getByRole("heading", { level: 1, name: ADMIN_TEXT.profile })).toBeVisible();
    const details = within(panel(ADMIN_TEXT.accountDetails));
    expect(details.getByText("admin@alhidaya.qa")).toBeVisible();
    const save = details.getByRole("button", { name: ADMIN_TEXT.saveName });
    expect(save).toBeDisabled();

    const name = details.getByRole("textbox", { name: ADMIN_TEXT.name });
    await user.clear(name);
    await user.type(name, "Fatima Ali");
    await user.click(save);
    expect(await details.findByText(ADMIN_TEXT.nameSaved)).toBeVisible();
    expect(router.refresh).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminProfile,
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Fatima Ali" }) }),
    );
  });

  it("says when the name could not be changed", async () => {
    const user = userEvent.setup();
    stubApi(() => ({ status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }));
    profile();
    const details = within(panel(ADMIN_TEXT.accountDetails));
    await user.type(details.getByRole("textbox", { name: ADMIN_TEXT.name }), " Ali");
    await user.click(details.getByRole("button", { name: ADMIN_TEXT.saveName }));
    expect(await details.findByRole("alert")).toHaveTextContent(ADMIN_TEXT.nameNotSaved);
  });

  it("changes the password with the current one, and clears the form", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(() => ({ data: { changed: true } }));
    profile();
    const change = within(panel(ADMIN_TEXT.changePassword));
    await user.type(change.getByLabelText(ADMIN_TEXT.currentPassword), "the old passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.newPassword), "a new long passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.confirmPassword), "a new long passphrase");
    await user.click(change.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await change.findByText(ADMIN_TEXT.passwordUpdated)).toBeVisible();
    expect(change.getByLabelText(ADMIN_TEXT.currentPassword)).toHaveValue("");
    expect(fetch).toHaveBeenCalledWith(
      ADMIN_API_ROUTES.adminProfilePassword,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("catches two new passwords that differ before sending, and marks a wrong current one", async () => {
    const user = userEvent.setup();
    const fetch = stubApi(() => ({
      status: 400,
      error: {
        code: "AUTH_PASSWORD_WRONG",
        message: ERROR_MESSAGES.AUTH_PASSWORD_WRONG,
        details: [{ path: "currentPassword", message: ERROR_MESSAGES.AUTH_PASSWORD_WRONG }],
      },
    }));
    profile();
    const change = within(panel(ADMIN_TEXT.changePassword));
    await user.type(change.getByLabelText(ADMIN_TEXT.currentPassword), "not the password");
    await user.type(change.getByLabelText(ADMIN_TEXT.newPassword), "a new long passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.confirmPassword), "a different passphrase");
    await user.click(change.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await change.findByText(VALIDATION_MESSAGES.passwordsDiffer)).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();

    await user.clear(change.getByLabelText(ADMIN_TEXT.confirmPassword));
    await user.type(change.getByLabelText(ADMIN_TEXT.confirmPassword), "a new long passphrase");
    await user.click(change.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await change.findByText(ERROR_MESSAGES.AUTH_PASSWORD_WRONG)).toBeVisible();
    expect(change.getByLabelText(ADMIN_TEXT.currentPassword)).toHaveAttribute("aria-invalid", "true");
    expect(change.queryByRole("alert")).toBeNull();
  });

  it("says when the password could not be changed for another reason", async () => {
    const user = userEvent.setup();
    stubApi(() => ({ status: 429, error: { code: "RATE_LIMITED", message: ERROR_MESSAGES.RATE_LIMITED } }));
    profile();
    const change = within(panel(ADMIN_TEXT.changePassword));
    await user.type(change.getByLabelText(ADMIN_TEXT.currentPassword), "the old passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.newPassword), "a new long passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.confirmPassword), "a new long passphrase");
    await user.click(change.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await change.findByRole("alert")).toHaveTextContent(ADMIN_TEXT.passwordNotChanged);
  });

  it("marks a name the server refuses beside the field", async () => {
    const user = userEvent.setup();
    stubApi(() => ({
      status: 400,
      error: {
        code: "VALIDATION_ERROR",
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        details: [{ path: "name", message: VALIDATION_MESSAGES.required("Name") }],
      },
    }));
    profile();
    const details = within(panel(ADMIN_TEXT.accountDetails));
    await user.type(details.getByRole("textbox", { name: ADMIN_TEXT.name }), " Ali");
    await user.click(details.getByRole("button", { name: ADMIN_TEXT.saveName }));
    expect(await details.findByText(VALIDATION_MESSAGES.required("Name"))).toBeVisible();
    expect(details.queryByRole("alert")).toBeNull();
  });

  it("says each panel is saving while the server answers", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    profile();
    const details = within(panel(ADMIN_TEXT.accountDetails));
    await user.type(details.getByRole("textbox", { name: ADMIN_TEXT.name }), " Ali");
    await user.click(details.getByRole("button", { name: ADMIN_TEXT.saveName }));
    expect(await details.findByRole("button", { name: ADMIN_TEXT.saving })).toHaveAttribute("aria-busy", "true");

    const change = within(panel(ADMIN_TEXT.changePassword));
    await user.type(change.getByLabelText(ADMIN_TEXT.currentPassword), "the old passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.newPassword), "a new long passphrase");
    await user.type(change.getByLabelText(ADMIN_TEXT.confirmPassword), "a new long passphrase");
    await user.click(change.getByRole("button", { name: ADMIN_TEXT.savePassword }));
    expect(await change.findByRole("button", { name: ADMIN_TEXT.saving })).toHaveAttribute("aria-busy", "true");
  });
});
