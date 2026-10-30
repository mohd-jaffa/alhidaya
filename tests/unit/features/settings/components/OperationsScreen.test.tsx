import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ERROR_MESSAGES } from "@/constants/messages";
import { OperationsScreen } from "@/features/settings/components/OperationsScreen";
import type { OperationsViewItem } from "@/features/settings/types";
import { DEFAULT_OPERATIONS } from "@/lib/content/operations";
import { dohaDateTime } from "@/lib/dates";
import type { OperationsPayload } from "@/lib/validation";
import { type Answer, stubApi, stubDialogs, WithSWR } from "@tests/support/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(stubDialogs);
afterEach(() => {
  vi.unstubAllGlobals();
});

const MB = 1024 * 1024;
const VIEW: OperationsViewItem = {
  operations: DEFAULT_OPERATIONS,
  disk: { media: { bytes: 40 * MB, budget: 250 * MB }, cvs: { bytes: 230 * MB, budget: 250 * MB } },
  lastPurge: { at: "2026-10-29T21:00:00.000Z", enquiries: 2, applications: 1, cvs: 3, filesNotDeleted: 1 },
};

function api(start: OperationsViewItem, write: (method: string) => Answer | undefined = () => undefined) {
  let current = start;
  return stubApi((method, _url, body) => {
    const answer = write(method);
    if (answer) return answer;
    if (method === "PUT") current = { ...current, operations: body as OperationsPayload };
    return { data: current };
  });
}

const puts = (fetch: ReturnType<typeof stubApi>) => fetch.mock.calls.filter(([, init]) => init?.method === "PUT");

describe("OperationsScreen (D95)", () => {
  it("shows the recipients, the keeping periods, each folder's room and the last clean-up", async () => {
    api(VIEW);
    render(<OperationsScreen />, { wrapper: WithSWR });
    expect(screen.getByLabelText(ADMIN_TEXT.loading)).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("heading", { level: 1, name: ADMIN_TEXT.operations })).toBeVisible();
    expect(screen.getAllByRole("textbox", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.recipient, 1) })[0]).toHaveValue(
      DEFAULT_OPERATIONS.enquiriesTo[0],
    );
    expect(screen.getByRole("spinbutton", { name: ADMIN_TEXT.retentionDays })).toHaveValue(180);
    expect(screen.getByRole("meter", { name: ADMIN_TEXT.cvFolder })).toHaveAttribute("aria-valuenow", "92");
    expect(
      screen.getByText(ADMIN_TEXT.purgeRan(dohaDateTime(new Date(VIEW.lastPurge!.at))), { exact: false }),
    ).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.purgeFilesLeft(1))).toBeVisible();
    expect(screen.getByRole("button", { name: ADMIN_TEXT.saveOperations })).toBeDisabled();
  });

  it("saves new recipients at once, and asks first before a keeping period changes", async () => {
    const fetch = api({ ...VIEW, lastPurge: { ...VIEW.lastPurge!, filesNotDeleted: 0 } });
    render(<OperationsScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.purgeDeleted(2, 1, 3), { exact: false })).toBeVisible();
    expect(screen.queryByText(ADMIN_TEXT.purgeFilesLeft(0))).toBeNull();
    await userEvent.click(screen.getAllByRole("button", { name: ADMIN_TEXT.addRecipient })[0]);
    await userEvent.type(
      screen.getAllByRole("textbox", { name: ADMIN_TEXT.numbered(ADMIN_TEXT.recipient, 2) })[0],
      "care@alhidaya.qa",
    );
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveOperations }));
    expect(await screen.findByText(ADMIN_TEXT.operationsSaved)).toBeVisible();
    expect(screen.queryByRole("dialog")).toBeNull();

    const retention = screen.getByRole("spinbutton", { name: ADMIN_TEXT.retentionDays });
    await userEvent.clear(retention);
    await userEvent.type(retention, "90");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveOperations }));
    const asked = screen.getByRole("dialog", { name: ADMIN_TEXT.keepingTitle });
    expect(asked).toHaveTextContent(ADMIN_TEXT.keepingBody(90, 180));
    await userEvent.click(within(asked).getByRole("button", { name: ADMIN_TEXT.keepEditing }));
    expect(puts(fetch)).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveOperations }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.change }));
    await waitFor(() => expect(puts(fetch)).toHaveLength(2));
    expect(JSON.parse(String(puts(fetch)[1][1]!.body))).toMatchObject({ retentionDays: 90 });
  });

  it("says when a change was not saved, or a period is out of range", async () => {
    api({ ...VIEW, lastPurge: null }, (method) =>
      method === "PUT"
        ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } }
        : undefined,
    );
    render(<OperationsScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.noPurgeYet)).toBeVisible();
    const expiry = screen.getByRole("spinbutton", { name: ADMIN_TEXT.cvExpiryDays });
    await userEvent.clear(expiry);
    await userEvent.type(expiry, "400");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveOperations }));
    expect(await screen.findByText(/CV expiry must be from 1 to 365/)).toBeVisible();
    await userEvent.clear(expiry);
    await userEvent.type(expiry, "30");
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.saveOperations }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: ADMIN_TEXT.change }));
    expect(await screen.findByText(ERROR_MESSAGES.INTERNAL_ERROR)).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.notSaved)).toBeVisible();
  });

  it("says when it did not load, with Try again", async () => {
    let fails = true;
    api(VIEW, () =>
      fails ? { status: 500, error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } } : undefined,
    );
    render(<OperationsScreen />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.loadFailed)).toBeVisible();
    fails = false;
    await userEvent.click(screen.getByRole("button", { name: ADMIN_TEXT.tryAgain }));
    expect(await screen.findByRole("heading", { level: 1, name: ADMIN_TEXT.operations })).toBeVisible();
  });
});
