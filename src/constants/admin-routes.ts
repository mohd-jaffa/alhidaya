import { type PageKey, pageSlug } from "./sections";

/**
 * The admin's pages and endpoints (plan §5.2, §29), named once, apart from
 * routes.ts so the public pages never carry them: every address that reaches
 * a public page counts against its JavaScript budget (plan §31), as the
 * admin's words do (admin-messages.ts).
 */
export const ADMIN_ROUTES = {
  login: "/admin/login",
  forgotPassword: "/admin/forgot-password",
  resetPassword: "/admin/reset-password",
  overview: "/admin",
  /** The eight pages with their state, and one page's editor (D88). */
  pages: "/admin/pages",
  page: (page: PageKey) => `/admin/pages/${pageSlug(page)}`,
  /** The services and the jobs, a new one, and one opened in its editor (D92). */
  services: "/admin/services",
  newService: "/admin/services/new",
  service: (id: string) => `/admin/services/${id}`,
  jobs: "/admin/jobs",
  newJob: "/admin/jobs/new",
  job: (id: string) => `/admin/jobs/${id}`,
  /** The client logos as the services, and the media library (D93). */
  clients: "/admin/clients",
  newClient: "/admin/clients/new",
  client: (id: string) => `/admin/clients/${id}`,
  media: "/admin/media",
  enquiries: "/admin/enquiries",
  enquiry: (id: string) => `/admin/enquiries/${id}`,
  applications: "/admin/applications",
  application: (id: string) => `/admin/applications/${id}`,
  settings: "/admin/settings",
  operations: "/admin/settings/operations",
  activity: "/admin/activity",
} as const;

/** What Activity's address can narrow it to (`?kind=`, D96); kept here, off the public pages, as the routes are. */
export const ACTIVITY_KINDS = ["CONTENT", "INBOX", "SETTINGS", "SIGN_INS"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/** Every endpoint the admin's screens call (AGENTS.md §14). */
export const ADMIN_API_ROUTES = {
  adminSession: "/api/admin/session",
  passwordForgot: "/api/admin/password/forgot",
  passwordReset: "/api/admin/password/reset",
  /** Today: enquiries and applications as one stream (D81). */
  adminToday: "/api/admin/today",
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
  /** The pages and their state; a page's draft, its publish and its discard (plan §14, D88). */
  adminPages: "/api/admin/pages",
  adminPage: (page: PageKey) => `/api/admin/pages/${pageSlug(page)}`,
  adminPagePublish: (page: PageKey) => `/api/admin/pages/${pageSlug(page)}/publish`,
  adminPageDiscard: (page: PageKey) => `/api/admin/pages/${pageSlug(page)}/discard`,
  /**
   * The services: made, saved, published, discarded, archived and restored
   * one at a time; their order saved, published and discarded (D92).
   */
  adminServices: "/api/admin/services",
  adminService: (id: string) => `/api/admin/services/${id}`,
  adminServicePublish: (id: string) => `/api/admin/services/${id}/publish`,
  adminServiceDiscard: (id: string) => `/api/admin/services/${id}/discard`,
  adminServiceArchive: (id: string) => `/api/admin/services/${id}/archive`,
  adminServiceOrder: "/api/admin/services/order",
  adminServiceOrderPublish: "/api/admin/services/order/publish",
  adminServiceOrderDiscard: "/api/admin/services/order/discard",
  /** The jobs, as the services, and a job closed or opened again (D92). */
  adminJobs: "/api/admin/jobs",
  adminJob: (id: string) => `/api/admin/jobs/${id}`,
  adminJobPublish: (id: string) => `/api/admin/jobs/${id}/publish`,
  adminJobDiscard: (id: string) => `/api/admin/jobs/${id}/discard`,
  adminJobArchive: (id: string) => `/api/admin/jobs/${id}/archive`,
  adminJobClose: (id: string) => `/api/admin/jobs/${id}/close`,
  /** The client logos, as the services (D92). */
  adminClients: "/api/admin/clients",
  adminClient: (id: string) => `/api/admin/clients/${id}`,
  adminClientPublish: (id: string) => `/api/admin/clients/${id}/publish`,
  adminClientDiscard: (id: string) => `/api/admin/clients/${id}/discard`,
  adminClientArchive: (id: string) => `/api/admin/clients/${id}/archive`,
  adminClientOrder: "/api/admin/clients/order",
  adminClientOrderPublish: "/api/admin/clients/order/publish",
  adminClientOrderDiscard: "/api/admin/clients/order/discard",
  /** The site's content (D94): its draft, published or discarded, and a new brochure uploaded. */
  adminSite: "/api/admin/site",
  adminSitePublish: "/api/admin/site/publish",
  adminSiteDiscard: "/api/admin/site/discard",
  adminSiteBrochure: "/api/admin/site/brochure",
  /** How the site runs (D95): recipients, keeping periods, the folders' use. */
  adminOperations: "/api/admin/operations",
  /** Activity: the admin's changes, newest first (D96). */
  adminActivity: "/api/admin/activity",
  /** The media library's images (D89, D93): listed and uploaded; one's words changed, or it deleted. */
  adminMedia: "/api/admin/media",
  adminMediaItem: (id: string) => `/api/admin/media/${id}`,
} as const;

/** The admin pages anyone may open: everything else under /admin needs a session (src/proxy.ts). */
export const ADMIN_PUBLIC_ROUTES: readonly string[] = [
  ADMIN_ROUTES.login,
  ADMIN_ROUTES.forgotPassword,
  ADMIN_ROUTES.resetPassword,
];

/** The timed jobs' endpoints (plan §17): called by the cPanel cron entries with CRON_SECRET, never by a page. */
export const CRON_ROUTES = {
  retention: "/api/cron/retention",
} as const;
