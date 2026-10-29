/** The company's own time zone (plan §1): Doha, UTC+3 all year. */
export const SITE_TIME_ZONE = "Asia/Qatar";

/**
 * A calendar day in Doha, "2026-10-29": when a job closes, a day is Doha's,
 * not the server's (which sits in Singapore) and not UTC's.
 */
export function dohaDay(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}
