/**
 * Every word the site shows (AGENTS.md §5): screens, metadata and emails read
 * from here, never from a string of their own. English now; an Arabic
 * catalogue sits beside it later (plan §33).
 */
export const UI_TEXT = {
  siteName: "Al Hidaya Health Care Services",
  siteDescription:
    "Nursing care at home and in clinics, and nurse staffing for hospitals, clinics and schools, in Doha, Qatar.",
  placeholderNote: "Our new website is on its way.",
  /** The first line of a WhatsApp chat a visitor starts; they still press send (plan Q14). */
  whatsappPrefill: "Hello Al Hidaya, I would like to ask about nursing care.",
} as const;

/**
 * What a failure says (AGENTS.md §10): one wording per code, shared by the
 * server's answers and the browser. A visitor reads the words, never the code,
 * and never a driver's or a library's own text.
 */
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Please check the highlighted fields.",
  VALIDATION_INVALID_JSON: "The request could not be read. Please try again.",
  UPLOAD_TOO_LARGE: "That file is too large.",

  AUTH_SESSION_REQUIRED: "Please sign in to continue.",
  AUTH_SESSION_INVALID: "Your session has expired. Please sign in again.",
  AUTH_PERMISSION_DENIED: "You don't have permission to do this.",

  NOT_FOUND: "We couldn't find what you were looking for.",
  RECORD_NOT_FOUND: "This item no longer exists. It may have been deleted.",
  CONFLICT: "This changed while you were working on it. Please reload and try again.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes and try again.",

  NETWORK_OFFLINE: "You're offline. Check your connection and try again.",
  NETWORK_UNREACHABLE: "We couldn't reach the server. Please try again in a moment.",
  EXTERNAL_SERVICE_ERROR: "A service we rely on didn't respond. Please try again in a moment.",

  CONFIG_INVALID: "The site is not set up correctly.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again.",
} as const;

export type ErrorMessageCode = keyof typeof ERROR_MESSAGES;

/**
 * What a field says when it is wrong, beside the field (AGENTS.md §12): one
 * wording whichever side catches the mistake, and never Zod's English.
 */
export const VALIDATION_MESSAGES = {
  invalid: "Please check this field.",
  required: (label: string) => `${label} is required.`,
  tooShort: (label: string, min: number) => `${label} must be at least ${min} characters.`,
  tooLong: (label: string, max: number) => `${label} can be at most ${max} characters.`,
  email: (label: string) => `${label} must look like name@example.com.`,
  phone: (label: string) => `${label} must be a Qatar number (8 digits) or start with a country code, like +44.`,
} as const;

export function isErrorMessageCode(code: string | null | undefined): code is ErrorMessageCode {
  return code != null && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code);
}

/** The wording for a code; an unknown code reads as a failure of our own, never as its raw text. */
export function getErrorMessage(code: string): string {
  return isErrorMessageCode(code) ? ERROR_MESSAGES[code] : ERROR_MESSAGES.INTERNAL_ERROR;
}
