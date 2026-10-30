import type { PageKey } from "./sections";

/**
 * Every page the site serves (plan §5.1, §5.2), named once. English at the
 * root; Arabic arrives later under /ar with the same paths (plan D4).
 */
export const ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  service: (slug: string) => `/services/${slug}`,
  careers: "/careers",
  job: (slug: string) => `/careers/${slug}`,
  applyForJob: (slug: string) => `/careers/${slug}/apply`,
  applyGeneral: "/careers/apply",
  contact: "/contact",
  quote: "/request-a-quote",
  /** The quote form with a service already chosen (plan §6.8). */
  quoteFor: (slug: string) => `/request-a-quote?service=${slug}`,
  privacy: "/privacy",
  terms: "/terms",
  brochure: "/brochure",
} as const;

/** Addresses under /careers the site keeps for itself, so no job can take one (plan §5.1). */
export const RESERVED_JOB_SLUGS: readonly string[] = ["apply"];

/** Where each of the fixed pages lives (plan §7.1). */
export const PAGE_ROUTES: Record<PageKey, string> = {
  HOME: ROUTES.home,
  ABOUT: ROUTES.about,
  SERVICES: ROUTES.services,
  CAREERS: ROUTES.careers,
  CONTACT: ROUTES.contact,
  QUOTE: ROUTES.quote,
  PRIVACY: ROUTES.privacy,
  TERMS: ROUTES.terms,
};

export const ADMIN_ROUTES = {
  login: "/admin/login",
  forgotPassword: "/admin/forgot-password",
  resetPassword: "/admin/reset-password",
  overview: "/admin",
  page: (key: string) => `/admin/pages/${key}`,
  services: "/admin/services",
  jobs: "/admin/jobs",
  clients: "/admin/clients",
  media: "/admin/media",
  enquiries: "/admin/enquiries",
  enquiry: (id: string) => `/admin/enquiries/${id}`,
  applications: "/admin/applications",
  application: (id: string) => `/admin/applications/${id}`,
  settings: "/admin/settings",
  operations: "/admin/settings/operations",
  activity: "/admin/activity",
} as const;

/** Every endpoint the browser calls, named once (AGENTS.md §14). */
export const API_ROUTES = {
  adminSession: "/api/admin/session",
  passwordForgot: "/api/admin/password/forgot",
  passwordReset: "/api/admin/password/reset",
  /** The Quote and Contact forms send here (plan §10). */
  enquiries: "/api/enquiries",
  /** The application form (plan §9.3). */
  applications: "/api/applications",
  /** The enquiries inbox (plan §10.5). */
  adminEnquiries: "/api/admin/enquiries",
  adminEnquiry: (id: string) => `/api/admin/enquiries/${id}`,
  adminEnquiryNotes: (id: string) => `/api/admin/enquiries/${id}/notes`,
  adminEnquiryRetryMail: (id: string) => `/api/admin/enquiries/${id}/retry-mail`,
  /** The applications inbox (plan §9.5), and an application's CV for the admin's download (§9.4). */
  adminApplications: "/api/admin/applications",
  adminApplication: (id: string) => `/api/admin/applications/${id}`,
  adminApplicationNotes: (id: string) => `/api/admin/applications/${id}/notes`,
  adminApplicationCv: (id: string) => `/api/admin/applications/${id}/cv`,
  adminApplicationRetryMail: (id: string) => `/api/admin/applications/${id}/retry-mail`,
  /** Opens a public page in the admin's preview of unpublished changes (plan §14). */
  preview: "/api/preview",
  /** Leaves the admin's preview of unpublished changes (R3.6). */
  previewExit: "/api/preview/exit",
} as const;

/** The admin pages anyone may open: everything else under /admin needs a session (src/proxy.ts). */
export const ADMIN_PUBLIC_ROUTES: readonly string[] = [
  ADMIN_ROUTES.login,
  ADMIN_ROUTES.forgotPassword,
  ADMIN_ROUTES.resetPassword,
];
