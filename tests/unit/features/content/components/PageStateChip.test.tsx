import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { PageStateChip, pageStatus } from "@/features/content/components/PageStateChip";

describe("PageStateChip", () => {
  it("says whether a page was never published, waits with saved changes, or is as published (D86)", () => {
    expect(pageStatus({ publishedAt: null, unpublishedChanges: true })).toEqual({
      tone: "new",
      label: ADMIN_TEXT.notPublishedYet,
    });
    expect(pageStatus({ publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true })).toEqual({
      tone: "progress",
      label: ADMIN_TEXT.changesNotPublished,
    });
    render(<PageStateChip state={{ publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false }} />);
    expect(screen.getByText(ADMIN_TEXT.published)).toBeVisible();
  });
});
