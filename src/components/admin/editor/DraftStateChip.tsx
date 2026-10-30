import { StatusChip, type StatusTone } from "@/components/admin/StatusChip";
import { ADMIN_TEXT } from "@/constants/admin-messages";

/** Where an editable thing stands (plan §14), as its endpoint answers it. */
export interface DraftState {
  publishedAt: string | null;
  unpublishedChanges: boolean;
  /** A service or a job taken off the site (D92). */
  archivedAt?: string | null;
}

/** Where it stands (D86, D92): off the site, never published, saved changes waiting, or as published. */
export function draftStatus(state: DraftState): { tone: StatusTone; label: string } {
  if (state.archivedAt) return { tone: "off", label: ADMIN_TEXT.archived };
  if (state.publishedAt === null) return { tone: "new", label: ADMIN_TEXT.notPublishedYet };
  if (state.unpublishedChanges) return { tone: "progress", label: ADMIN_TEXT.changesNotPublished };
  return { tone: "done", label: ADMIN_TEXT.published };
}

export function DraftStateChip({ state }: { state: DraftState }) {
  const { tone, label } = draftStatus(state);
  return <StatusChip tone={tone}>{label}</StatusChip>;
}
