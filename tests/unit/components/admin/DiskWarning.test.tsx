import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DiskWarning } from "@/components/admin/DiskWarning";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const MB = 1024 * 1024;
const view = (media: number, cvs: number) => ({
  operations: {},
  disk: { media: { bytes: media * MB, budget: 250 * MB }, cvs: { bytes: cvs * MB, budget: 250 * MB } },
  lastPurge: null,
});

describe("DiskWarning (D95)", () => {
  it("warns on Today once a folder passes 80%, saying what makes room in each", async () => {
    stubApi(() => ({ data: view(225, 210) }));
    render(<DiskWarning />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.diskWarningTitle)).toBeVisible();
    expect(screen.getByText(ADMIN_TEXT.diskWarningMedia(90), { exact: false })).toBeVisible();
    expect(screen.getByRole("link", { name: ADMIN_TEXT.media })).toHaveAttribute("href", ADMIN_ROUTES.media);
    expect(screen.getByRole("link", { name: ADMIN_TEXT.operations })).toHaveAttribute("href", ADMIN_ROUTES.operations);
  });

  it("names only the folder that is nearly full", async () => {
    stubApi(() => ({ data: view(10, 230) }));
    render(<DiskWarning />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.diskWarningCvs(92), { exact: false })).toBeVisible();
    expect(screen.queryByRole("link", { name: ADMIN_TEXT.media })).toBeNull();
  });

  it("says applicants are asked to send their CV again once one no longer fits (D84)", async () => {
    stubApi(() => ({ data: view(10, 247) }));
    render(<DiskWarning />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.diskFullCvs(99), { exact: false })).toBeVisible();
  });

  it("names the media folder alone when the CVs have room", async () => {
    stubApi(() => ({ data: view(240, 10) }));
    render(<DiskWarning />, { wrapper: WithSWR });
    expect(await screen.findByText(ADMIN_TEXT.diskWarningMedia(96), { exact: false })).toBeVisible();
    expect(screen.queryByRole("link", { name: ADMIN_TEXT.operations })).toBeNull();
  });

  it("says nothing while there is room, or before it is read", async () => {
    const fetch = stubApi(() => ({ data: view(10, 10) }));
    const { container } = render(<DiskWarning />, { wrapper: WithSWR });
    expect(container).toBeEmptyDOMElement();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
