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
  privacy: "/privacy",
  terms: "/terms",
  brochure: "/brochure",
} as const;

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
  applications: "/admin/applications",
  settings: "/admin/settings",
  operations: "/admin/settings/operations",
  activity: "/admin/activity",
} as const;

/** The admin pages anyone may open: everything else under /admin needs a session (src/proxy.ts). */
export const ADMIN_PUBLIC_ROUTES: readonly string[] = [
  ADMIN_ROUTES.login,
  ADMIN_ROUTES.forgotPassword,
  ADMIN_ROUTES.resetPassword,
];
