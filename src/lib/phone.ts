/**
 * Phone numbers (plan §9.2, §10): stored as E.164 ("+97431306555") whichever
 * way they were typed, so one number is one number. A Qatar number may be
 * typed without its country code; any other needs one, written + or 00.
 */
const QATAR_CODE = "974";

/** Qatar's national numbers: 8 digits, mobiles from 3, 5, 6, 7 and landlines from 4. */
const QATAR_NATIONAL = /^[3-7]\d{7}$/;

/** E.164: a country code that does not start with 0, at most 15 digits in all. */
const E164_DIGITS = /^[1-9]\d{7,14}$/;

export function toE164(raw: string): string | null {
  const typed = raw.trim();
  // Spaces, dots, hyphens and brackets are how people write numbers, nothing
  // more; the + may sit inside a bracket, as in "(+974) 4444 1234".
  if (!/^\(?\+?[\d\s().-]+$/.test(typed)) return null;
  let digits = typed.replace(/\D/g, "");
  const international = /^\(?\+/.test(typed) || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (!international) return QATAR_NATIONAL.test(digits) ? `+${QATAR_CODE}${digits}` : null;
  if (digits.startsWith(QATAR_CODE)) {
    return QATAR_NATIONAL.test(digits.slice(QATAR_CODE.length)) ? `+${digits}` : null;
  }
  return E164_DIGITS.test(digits) ? `+${digits}` : null;
}

/** A number as people read it: Qatar's as "+974 3130 6555", any other as stored. */
export function formatPhone(e164: string): string {
  const national = e164.startsWith(`+${QATAR_CODE}`) ? e164.slice(QATAR_CODE.length + 1) : null;
  return national && QATAR_NATIONAL.test(national)
    ? `+${QATAR_CODE} ${national.slice(0, 4)} ${national.slice(4)}`
    : e164;
}

/** A number to dial from a tap: "tel:+97431306555". */
export function callHref(e164: string): string {
  return `tel:${e164}`;
}

/**
 * A chat on WhatsApp, with no integration (plan D9): wa.me takes the number
 * as digits with the country code first and no +, and an optional first
 * message, which the visitor still sends themselves.
 */
export function whatsAppHref(e164: string, text?: string): string {
  const chat = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return text ? `${chat}?text=${encodeURIComponent(text)}` : chat;
}
