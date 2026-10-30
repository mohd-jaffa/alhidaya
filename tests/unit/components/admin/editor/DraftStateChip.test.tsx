import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { DraftStateChip, draftStatus } from "@/components/admin/editor/DraftStateChip";

describe("DraftStateChip", () => {
  it("says whether it is archived, was never published, waits with saved changes, or is as published (D86, D92)", () => {
    expect(draftStatus({ publishedAt: null, unpublishedChanges: true })).toEqual({
      tone: "new",
      label: ADMIN_TEXT.notPublishedYet,
    });
    expect(draftStatus({ publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: true })).toEqual({
      tone: "progress",
      label: ADMIN_TEXT.changesNotPublished,
    });
    expect(
      draftStatus({
        publishedAt: "2026-10-29T08:00:00Z",
        unpublishedChanges: true,
        archivedAt: "2026-10-30T08:00:00Z",
      }),
    ).toEqual({ tone: "off", label: ADMIN_TEXT.archived });
    render(<DraftStateChip state={{ publishedAt: "2026-10-29T08:00:00Z", unpublishedChanges: false }} />);
    expect(screen.getByText(ADMIN_TEXT.published)).toBeVisible();
  });
});
