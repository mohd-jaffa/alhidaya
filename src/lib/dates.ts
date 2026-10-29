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

/** A calendar day as a visitor reads it: "2026-11-30" is "30 November 2026". */
export function readableDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, date)),
  );
}
