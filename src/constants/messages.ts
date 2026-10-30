/**
 * Every word the site shows (AGENTS.md §5): screens, metadata and emails read
 * from here, never from a string of their own. English now; an Arabic
 * catalogue sits beside it later (plan §33).
 */
export const UI_TEXT = {
  siteName: "Al Hidaya Health Care Services",
  siteDescription:
    "Nursing care at home and in clinics, and nurse staffing for hospitals, clinics and schools, in Doha, Qatar.",
  /** The first line of a WhatsApp chat a visitor starts; they still press send (plan Q14). */
  whatsappPrefill: "Hello Al Hidaya, I would like to ask about nursing care.",
  /** The line's own words (plan §30.1). */
  onThisPage: "On this page",
  youAreHere: "You are here",
  /** The three lines' names (plan §6.1, D71): fixed, like their actions and colours. */
  lineCareAtHome: "Care at home",
  lineStaffing: "Staffing for hospitals, clinics and schools",
  lineCareers: "Nurses: join us",
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
  /** The system pages (plan §6.10): a sign that says where the visitor is, and the way back. */
  notFoundTitle: "Page not found",
  notFoundHeadline: "This page is not on our map",
  notFoundLede: "The address may be mistyped, or the page may have moved. These will take you on.",
  errorHeadline: "This page did not load",
  errorLede: "Please try again. If it keeps happening, call or message us and we will help.",
  tryAgain: "Try again",
  home: "Home",
  services: "Services",
  careers: "Careers",
  contact: "Contact",
  errorReference: "Reference",
  /** The kit's own words (plan §30.3). */
  close: "Close",
  optional: "optional",
  chooseFile: "Choose a file",
  replaceFile: "Choose another file",
  noFileChosen: "No file chosen",
  loading: "Loading",
  /** The pages' sections (plan §7.2): the words the admin does not edit. */
  mission: "Our mission",
  vision: "Our vision",
  openJobs: "Open jobs",
  allOpenJobs: "All open jobs",
  generalApplication: "Send a general application",
  closes: "Closes",
  phone: "Phone",
  address: "Address",
  hours: "Hours",
  openInMaps: "Open in Google Maps",
  downloadBrochure: "Download our brochure",
  /** The static map on Contact (plan §30.6). */
  mapLabel: "Map of the streets around Asmakh Mall, Al Sadd, Doha",
  mapWithOffice: (office: string) =>
    `Map of the streets around Asmakh Mall, Al Sadd, Doha, with our office at ${office}`,
  mapAttribution: "Map data © OpenStreetMap contributors",
  /** A service's page (plan §6.4). */
  aboutService: "About this service",
  whoItIsFor: "Who it is for",
  whatItIncludes: "What it includes",
  /** A job's page (plan §6.6). */
  aboutJob: "About this job",
  responsibilities: "What you will do",
  qualifications: "What we ask for",
  benefits: "What we offer",
  jobFacts: "The job at a glance",
  location: "Location",
  employment: "Employment",
  department: "Department",
  experience: "Experience",
  posted: "Posted",
  closedOn: "Closed",
  applyForJob: "Apply for this job",
  jobClosed: "This job has closed",
  jobClosedBody: "It no longer takes applications. You can apply for an open job, or send a general application.",
  otherOpenJobs: "Open jobs",
  /**
   * The enquiry forms (plan §10). An enquiry keeps each label as the visitor
   * saw it (§10.4), so a later change here never rewrites one already sent.
   */
  yourName: "Your name",
  organisation: "Organisation",
  careFor: "Who is the care for?",
  service: "Service",
  serviceHint: "Not sure? Leave this as it is, and tell us in your message.",
  serviceNotSure: "Not sure yet",
  phoneHint: "A Qatar number, or any number with its country code.",
  contactMethod: "How should we reach you?",
  message: "Message",
  quoteMessageHint: "The care you need, who it is for, and from when.",
  consent: "I agree that Al Hidaya may use these details to answer me.",
  privacyNotice: "Read our privacy notice",
  consentGiven: "Yes",
  sendQuote: "Send my request",
  sendMessage: "Send message",
  sending: "Sending",
  quoteSent: "Thank you. We have your request.",
  messageSent: "Thank you. We have your message.",
  sentNext: "We will be in touch soon.",
  fasterOnWhatsApp: "For a faster answer, message us on WhatsApp.",
  quoteNotSent: "Your request was not sent.",
  messageNotSent: "Your message was not sent.",
  nothingLost: "What you typed is still here.",
  formNeedsScript: "This form needs JavaScript. You can call, email or message us on WhatsApp instead.",
  /**
   * The application (plan §9.2, Q7). Like an enquiry, an application keeps
   * each label as the applicant saw it.
   */
  yourApplication: "Your application",
  applyLede: "Tell us where you are with your licence, and send your CV. It takes a few minutes.",
  applyFor: (job: string) => `Apply for ${job}`,
  applyingFor: "You are applying for",
  generalApplicationHeadline: "A general application",
  generalApplicationLede: "No open job that fits? Send us your CV, and tell us where you are with your licence.",
  generalApplicationFor: "This application is for no one job in particular. It goes to our team with your CV.",
  fullName: "Full name",
  whereNow: "Where are you now?",
  mophLicence: "Your MOPH licence",
  dataflow: "Dataflow verification",
  prometric: "Prometric exam",
  experienceYears: "Years of nursing experience",
  experienceYearsHint: "A whole number, like 3. Write 0 if you are newly qualified.",
  cv: "Your CV",
  cvHint: (max: string) => `A PDF or Word file, at most ${max}.`,
  applicationNote: "Anything else we should know",
  applicationNoteHint: "Your specialty, when you could start, or anything else that helps.",
  sendApplication: "Send my application",
  applicationSent: "Thank you. We have your application.",
  applicationSentNext: "Our team will read it, and will contact you if it suits an opening.",
  applicationNotSent: "Your application was not sent.",
  /** The forms' trap for bots (plan §10.3): hidden from everyone, said plainly for anyone who meets it. */
  honeypot: "Leave this empty",
  botCheckUnavailable:
    "The check that a person is sending this did not load. Please reload the page, or call or message us on WhatsApp.",
} as const;

/** Each page's short name (plan §7.1): where its line starts, as "You are here" names it. */
export const PAGE_NAMES = {
  HOME: "Home",
  ABOUT: "About",
  SERVICES: "Services",
  CAREERS: "Careers",
  CONTACT: "Contact",
  QUOTE: "Request a quote",
  PRIVACY: "Privacy",
  TERMS: "Terms",
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
  BOT_CHECK_FAILED: "We could not confirm that a person sent this. Please send it again.",
  EMAIL_ALREADY_SENT: "This email was already sent.",
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
  slugReserved: "This web address is the site's own. Please choose a different one.",
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
  /** The enquiry forms' choices (plan §10.1). */
  careFor: "Please choose who the care is for.",
  contactMethod: "Please choose how we should reach you.",
  service: "Please choose a service from the list, or Not sure yet.",
  consent: "Please agree, so that we can use your details to answer you.",
  botCheck: "We are still checking that a person is sending this. If a box appears, tick it, then send again.",
  /** The application form's choices and its CV (plan §9.2, Q4). */
  whereNow: "Please choose where you are now.",
  mophLicence: "Please choose where you are with your MOPH licence.",
  dataflow: "Please choose where you are with Dataflow.",
  prometric: "Please choose where you are with Prometric.",
  cvRequired: "Please choose your CV to send.",
  cvSize: (max: string) => `Your CV can be at most ${max}. Please send a smaller file.`,
  cvType: "Your CV must be a PDF or a Word file (.pdf, .doc or .docx).",
} as const;

export function isErrorMessageCode(code: string | null | undefined): code is ErrorMessageCode {
  return code != null && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code);
}

/** The wording for a code; an unknown code reads as a failure of our own, never as its raw text. */
export function getErrorMessage(code: string): string {
  return isErrorMessageCode(code) ? ERROR_MESSAGES[code] : ERROR_MESSAGES.INTERNAL_ERROR;
}

/** Every word of every email the site sends (AGENTS.md §16). */
export const MAIL_TEXT = {
  greeting: (name: string) => `Hello ${name},`,
  /** Under a button, for a mail app that will not show one. */
  linkFallback: "If the button doesn't work, copy this link into your browser:",
  linkValid: (minutes: number) => `The link works for ${minutes} minutes, and only once.`,
  /** A new Quote or Contact enquiry, to the enquiries recipients (plan §10.4); Reply-To is the visitor. */
  enquiryAlert: {
    QUOTE: {
      subject: (name: string) => `New quote request from ${name}`,
      preheader: "Sent through the website's Request a Quote form.",
      heading: "New quote request",
      form: "Request a Quote",
    },
    CONTACT: {
      subject: (name: string) => `New message from ${name}`,
      preheader: "Sent through the website's Contact form.",
      heading: "New message",
      form: "Contact",
    },
    received: (name: string, form: string, when: string) =>
      `${name} sent this through the ${form} form on ${when}, Doha time.`,
    action: "Open it in the inbox",
    footnote: (name: string) =>
      `Reply to this email to answer ${name} directly. The website sends these alerts to the addresses set in its admin, under Operations.`,
  },
  /**
   * A new application, to the applications recipients (plan §9.3), with the
   * CV attached; Reply-To is the applicant.
   */
  applicationAlert: {
    subject: (name: string, job: string | null) =>
      job ? `Application for ${job} from ${name}` : `General application from ${name}`,
    preheader: "Sent through the website's application form.",
    heading: (job: string | null) => (job ? "New application" : "New general application"),
    received: (name: string, job: string | null, when: string) =>
      job
        ? `${name} applied for ${job} on ${when}, Doha time.`
        : `${name} sent a general application on ${when}, Doha time.`,
    cvAttached: (file: string) => `Their CV is attached, as ${file}.`,
    cvNotAttached: "Their CV is not attached: the website no longer has it. Ask them for it when you reply.",
    job: "Job",
    general: "General application",
    cv: "CV as uploaded",
    action: "Open it in the inbox",
    footnote: (name: string) =>
      `Reply to this email to answer ${name} directly. The website sends these emails to the addresses set in its admin, under Operations.`,
  },
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
