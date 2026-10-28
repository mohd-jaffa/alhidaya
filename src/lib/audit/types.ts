import type { AuditAction } from "@/constants/statuses";

/**
 * One change, as the feature that made it describes it (AGENTS.md §11). The
 * admin who made it comes from the session the route checked, never from
 * the request.
 */
export interface AuditEntry {
  /** The signed-in admin; null for the site's own work (the retention purge). */
  actorId: string | null;
  action: AuditAction;
  /** The table the row belongs to. */
  entityType: string;
  entityId?: string | null;
  /**
   * What changed: `{ field: { from, to } }` for what is not personal, the
   * field names alone for anything personal (AGENTS.md §8).
   */
  changes?: Record<string, unknown> | null;
  /** A line for the activity screen; never a visitor's or applicant's name. */
  summary?: string | null;
  /** The request it was part of, to find its log lines. */
  requestId?: string | null;
}
