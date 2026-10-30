import type { PageKey } from "./sections";

/**
 * Every page the site serves (plan §5.1), named once; the admin's are in
 * admin-routes.ts. English at the root; Arabic arrives later under /ar with
 * the same paths (plan D4).
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

/** Every endpoint the public pages call, named once (AGENTS.md §14); the admin's are in admin-routes.ts. */
export const API_ROUTES = {
  /** The Quote and Contact forms send here (plan §10). */
  enquiries: "/api/enquiries",
  /** The application form (plan §9.3). */
  applications: "/api/applications",
  /** Opens a public page in the admin's preview of unpublished changes (plan §14). */
  preview: "/api/preview",
  /** Leaves the admin's preview of unpublished changes (R3.6). */
  previewExit: "/api/preview/exit",
} as const;
