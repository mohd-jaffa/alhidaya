/**
 * The forms' trap for bots (plan §10.3): a field no person sees or reaches,
 * named so that no browser fills it in for them. A form that comes back with
 * it filled is answered as if it were taken, and thrown away.
 */
export const HONEYPOT_FIELD = "your_reference";

export function honeypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null || !(HONEYPOT_FIELD in body)) return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value !== "string" || value.trim() !== "";
}
