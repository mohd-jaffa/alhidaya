/** The company's own time zone (plan §1): Doha, UTC+3 all year. */
export const SITE_TIME_ZONE = "Asia/Qatar";
/** Doha's offset from UTC, which never changes (no daylight saving). */
export const SITE_TIME_ZONE_OFFSET = "+03:00";

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

/** A moment as the team reads it in Doha: "29 October 2026 at 11:01". */
export function dohaDateTime(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

/** The time of day in Doha, on a 24-hour clock: "11:01". */
export function dohaTime(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

/** A day in Doha as a log heads it: "Thursday 29 October 2026". */
export function dohaDayHeading(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(at);
  // Every part is asked for above, so each is there.
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((piece) => piece.type === type)!.value;
  return `${part("weekday")} ${part("day")} ${part("month")} ${part("year")}`;
}
