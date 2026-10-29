/** Who made a change, and in which request: the admin from the checked session (AGENTS.md §11). */
export interface Actor {
  adminId: string | null;
  requestId: string | null;
}
