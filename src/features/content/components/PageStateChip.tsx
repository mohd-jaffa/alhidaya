import { StatusChip, type StatusTone } from "@/components/admin/StatusChip";
import { ADMIN_TEXT } from "@/constants/admin-messages";

import type { PageStateItem } from "../types";

/** Where a page stands (D86): never published, saved changes waiting, or as published. */
export function pageStatus(state: Pick<PageStateItem, "publishedAt" | "unpublishedChanges">): {
  tone: StatusTone;
  label: string;
} {
  if (state.publishedAt === null) return { tone: "new", label: ADMIN_TEXT.notPublishedYet };
  if (state.unpublishedChanges) return { tone: "progress", label: ADMIN_TEXT.changesNotPublished };
  return { tone: "done", label: ADMIN_TEXT.published };
}

export function PageStateChip({ state }: { state: Pick<PageStateItem, "publishedAt" | "unpublishedChanges"> }) {
  const { tone, label } = pageStatus(state);
  return <StatusChip tone={tone}>{label}</StatusChip>;
}
