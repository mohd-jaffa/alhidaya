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
  /** The line's own words (plan §30.1). */
  onThisPage: "On this page",
  youAreHere: "You are here",
  /** The kit preview page, local and test only (plan D64). */
  kitPreview: "Kit preview",
  /** The ways to reach the company (plan §6.7, D9); WhatsApp keeps the site's chat pictogram (D66). */
  whatsapp: "WhatsApp",
  call: "Call",
  email: "Email",
  /** The site's frame (plan R2.6). */
  skipToContent: "Skip to content",
  mainNavigation: "Main",
  menu: "Menu",
  footerNavigation: "Footer",
  contactHeading: "Contact",
  followUs: "Follow us",
  brochure: "Brochure",
  requestQuote: "Request a quote",
  whatsappButton: "Chat with us on WhatsApp",
  copyright: "All rights reserved.",
  previewBar: "You are seeing a preview of unpublished changes.",
  previewExit: "Leave preview",
  /** The kit's own words (plan §30.3). */
  close: "Close",
  optional: "optional",
  chooseFile: "Choose a file",
  replaceFile: "Choose another file",
  noFileChosen: "No file chosen",
  loading: "Loading",
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
  UPLOAD_TYPE_NOT_ALLOWED: "That type of file can't be uploaded here.",
  STORAGE_FULL: "There is no room left for this file. Please remove older files first.",

  AUTH_SESSION_REQUIRED: "Please sign in to continue.",
  AUTH_SESSION_INVALID: "Your session has expired. Please sign in again.",
  AUTH_PERMISSION_DENIED: "You don't have permission to do this.",
  // One wording for a wrong password and an unknown email (plan §26.4).
  AUTH_INVALID_CREDENTIALS: "That email and password don't match.",
  AUTH_LOCKED: "Too many attempts. Sign-in is paused for 15 minutes.",
  AUTH_RESET_INVALID: "This reset link has expired or was already used. Please ask for a new one.",
  REQUEST_ORIGIN_REFUSED: "This request was refused. Please reload the page and try again.",

  NOT_FOUND: "We couldn't find what you were looking for.",
  RECORD_NOT_FOUND: "This item no longer exists. It may have been deleted.",
  CONFLICT: "This changed while you were working on it. Please reload and try again.",
  SLUG_TAKEN: "Another one already uses this web address. Please choose a different one.",
  NOTHING_PUBLISHED: "There is no published version to go back to yet.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes and try again.",
  JOB_CLOSED: "This job is no longer open. You can apply for an open job, or send a general application.",

  NETWORK_OFFLINE: "You're offline. Check your connection and try again.",
  NETWORK_UNREACHABLE: "We couldn't reach the server. Please try again in a moment.",
  EXTERNAL_SERVICE_ERROR: "A service we rely on didn't respond. Please try again in a moment.",
  MAIL_NOT_CONFIGURED: "Email is not set up on this site yet.",

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
  passwordLength: (min: number, max: number) => `Use a password of ${min} to ${max} characters.`,
  link: "Use a page of this site (starting with /) or a full https:// address.",
  slug: "Use lowercase letters, numbers and single hyphens, like home-nursing-care.",
  date: (label: string) => `${label} must be a date.`,
  closesBeforePosted: "The closing date can't be before the posting date.",
  between: (label: string, min: number, max: number) => `${label} must be from ${min} to ${max}.`,
  atMost: (label: string, max: number) => `${label} can hold at most ${max}.`,
  atLeastOne: (label: string) => `${label} needs at least one.`,
  noRepeats: (label: string) => `${label} can't list the same one twice.`,
  signFirst: "The page's sign must come first and stay visible.",
  sectionNotAllowed: (type: string) => `This page can't hold a ${type} section.`,
  sectionLimit: (type: string, max: number) =>
    `This page can hold at most ${max} ${type} section${max === 1 ? "" : "s"}.`,
  sectionRequired: (type: string) => `This page needs a visible ${type} section.`,
} as const;

export function isErrorMessageCode(code: string | null | undefined): code is ErrorMessageCode {
  return code != null && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code);
}

/** The wording for a code; an unknown code reads as a failure of our own, never as its raw text. */
export function getErrorMessage(code: string): string {
  return isErrorMessageCode(code) ? ERROR_MESSAGES[code] : ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * Every word of every email the site sends (AGENTS.md §16). The enquiry and
 * application alerts join with their forms (R4.3, R5.4).
 */
export const MAIL_TEXT = {
  greeting: (name: string) => `Hello ${name},`,
  /** Under a button, for a mail app that will not show one. */
  linkFallback: "If the button doesn't work, copy this link into your browser:",
  linkValid: (minutes: number) => `The link works for ${minutes} minutes, and only once.`,
  passwordReset: {
    subject: `Reset your ${UI_TEXT.siteName} admin password`,
    preheader: "Choose a new password for the website's admin panel.",
    heading: "Reset your password",
    body: "Someone asked to reset the password of the website's admin panel for this address. If it was you, choose a new one below.",
    action: "Choose a new password",
    footnote:
      "If you didn't ask for this, you can ignore this email: your password stays as it is. Nobody at Al Hidaya will ever ask you for it.",
  },
} as const;
