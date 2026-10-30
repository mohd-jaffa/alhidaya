import { and, asc, eq, lt, or } from "drizzle-orm";

import { MAIL_RETRIES } from "@/constants/limits";
import type { EmailStatus } from "@/constants/statuses";
import { getDb } from "@/db/client";
import type { applications, enquiries } from "@/db/schema";

/** What one run of the mail-retry cron did with one inbox's emails (D85). */
export interface RetryRun {
  tried: number;
  sent: number;
}

/**
 * The mail-retry cron's work for one inbox (D85, plan §17): each email to the
 * team not sent, or still marked as sending long after it arrived, sent again
 * while it has tries left, oldest first and a few a run. Each try is recorded
 * on its row before it is made, and only by the run that recorded it, so two
 * runs never send one email twice. `send` is the feature's own, handed in so
 * lib needs none; it marks the email sent or not.
 */
export async function retryUnsentMail(
  table: typeof enquiries | typeof applications,
  send: (id: string) => Promise<EmailStatus>,
  at: Date = new Date(),
): Promise<RetryRun> {
  const db = getDb();
  const stuck = new Date(at.getTime() - MAIL_RETRIES.pendingAfterMs);
  const due = await db
    .select({ id: table.id, retries: table.emailRetries })
    .from(table)
    .where(
      and(
        or(eq(table.emailStatus, "NOT_SENT"), and(eq(table.emailStatus, "PENDING"), lt(table.createdAt, stuck))),
        lt(table.emailRetries, MAIL_RETRIES.tries),
      ),
    )
    .orderBy(asc(table.createdAt))
    .limit(MAIL_RETRIES.perRun);

  const run: RetryRun = { tried: 0, sent: 0 };
  for (const { id, retries } of due) {
    const [{ affectedRows }] = await db
      .update(table)
      .set({ emailRetries: retries + 1, emailRetriedAt: at })
      .where(and(eq(table.id, id), eq(table.emailRetries, retries)));
    // Another run recorded this try first, and makes it.
    if (affectedRows === 0) continue;
    run.tried += 1;
    if ((await send(id)) === "SENT") run.sent += 1;
  }
  return run;
}
