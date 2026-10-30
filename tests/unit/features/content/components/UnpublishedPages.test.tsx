import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { UnpublishedPages } from "@/features/content/components/UnpublishedPages";
import { stubApi, WithSWR } from "@tests/support/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("UnpublishedPages", () => {
  it("lists on Today each page with saved changes not on the website yet (D86)", async () => {
    stubApi(() => ({
      data: [
        { page: "HOME", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true },
        { page: "ABOUT", publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false },
      ],
    }));
    render(<UnpublishedPages />, { wrapper: WithSWR });
    const section = await screen.findByRole("region", { name: ADMIN_TEXT.notPublishedYet });
    expect(within(section).getByRole("link", { name: "Home" })).toHaveAttribute("href", ADMIN_ROUTES.page("HOME"));
    expect(within(section).queryByRole("link", { name: "About" })).toBeNull();
  });

  it("shows nothing while nothing waits", async () => {
    const fetch = stubApi(() => ({ data: [] }));
    const { container } = render(<UnpublishedPages />, { wrapper: WithSWR });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
