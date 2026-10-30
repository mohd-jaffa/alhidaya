import { eq } from "drizzle-orm";

import { CV_EXPIRY_DAYS, RETENTION_DAYS } from "@/constants/limits";
import { SITE } from "@/constants/site";
import { AUDIT_ENTITIES } from "@/constants/statuses";
import { getDb } from "@/db/client";
import { OPERATIONS_ID, siteOperations } from "@/db/schema";
import { logActionSafe } from "@/lib/audit/auditLog";
import type { OperationsPayload } from "@/lib/validation";

import type { Actor } from "./actor";

/** How the site runs until the admin first changes it (plan Q8, Q17). */
export const DEFAULT_OPERATIONS: OperationsPayload = {
  enquiriesTo: [SITE.defaultRecipients.enquiries],
  applicationsTo: [SITE.defaultRecipients.applications],
  retentionDays: RETENTION_DAYS.default,
  cvExpiryDays: CV_EXPIRY_DAYS.default,
};

/** Who receives each form's emails, and how long things are kept (plan §13). */
export async function getOperations(): Promise<OperationsPayload> {
  const [row] = await getDb()
    .select({
      enquiriesTo: siteOperations.enquiriesTo,
      applicationsTo: siteOperations.applicationsTo,
      retentionDays: siteOperations.retentionDays,
      cvExpiryDays: siteOperations.cvExpiryDays,
    })
    .from(siteOperations)
    .where(eq(siteOperations.id, OPERATIONS_ID));
  return row ?? DEFAULT_OPERATIONS;
}

/** Changes how the site runs; it takes effect at once and is recorded with what changed. */
export async function updateOperations(next: OperationsPayload, actor: Actor): Promise<void> {
  const before = await getOperations();
  await getDb()
    .insert(siteOperations)
    .values({ id: OPERATIONS_ID, ...next, updatedBy: actor.adminId })
    .onDuplicateKeyUpdate({ set: { ...next, updatedBy: actor.adminId, updatedAt: new Date() } });
  const changes = Object.fromEntries(
    (Object.keys(next) as (keyof OperationsPayload)[])
      .filter((field) => JSON.stringify(before[field]) !== JSON.stringify(next[field]))
      .map((field) => [field, { from: before[field], to: next[field] }]),
  );
  await logActionSafe({
    actorId: actor.adminId,
    action: "SETTINGS_CHANGE",
    entityType: AUDIT_ENTITIES.operations,
    entityId: OPERATIONS_ID,
    changes,
    requestId: actor.requestId,
  });
}
