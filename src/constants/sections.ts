/**
 * The pages and their sections (plan §7, D58): the pages are a fixed set, and
 * each may hold only the section types listed for it, at most as many of each
 * as allowed. Every page opens with its sign, which can be neither hidden nor
 * moved; some pages must keep a section they cannot work without.
 */
export const PAGE_KEYS = ["HOME", "ABOUT", "SERVICES", "CAREERS", "CONTACT", "QUOTE", "PRIVACY", "TERMS"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

/** A page as the admin's addresses name it (D88): /admin/pages/home. */
export const pageSlug = (page: PageKey): string => page.toLowerCase();

/** The page an admin address names, or null for one that is not a page. */
export const pageFromSlug = (slug: string): PageKey | null => PAGE_KEYS.find((page) => pageSlug(page) === slug) ?? null;

export const SECTION_TYPES = [
  "SIGN",
  "INTRO",
  "SERVICES_INDEX",
  "VALUES",
  "MISSION",
  "INSTITUTIONS",
  "CLIENTS",
  "CAREERS_BAND",
  "JOBS_LIST",
  "CONTACT_BAND",
  "CONTACT_DETAILS",
  "FORM",
  "RICH_TEXT",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export interface PageRule {
  /** The types the page may hold, each at most once unless `max` says more. */
  allowed: readonly SectionType[];
  max?: Partial<Record<SectionType, number>>;
  /** What the page cannot work without, besides its sign. */
  required?: readonly SectionType[];
}

/** The section every page opens with (plan §6, §7.2). */
export const FIXED_FIRST_SECTION: SectionType = "SIGN";

export const PAGE_RULES: Record<PageKey, PageRule> = {
  HOME: {
    allowed: ["SIGN", "INTRO", "SERVICES_INDEX", "VALUES", "INSTITUTIONS", "CLIENTS", "CAREERS_BAND", "CONTACT_BAND"],
  },
  ABOUT: {
    allowed: ["SIGN", "INTRO", "RICH_TEXT", "MISSION", "VALUES", "CLIENTS", "CONTACT_BAND"],
    max: { RICH_TEXT: 4 },
  },
  SERVICES: { allowed: ["SIGN", "SERVICES_INDEX", "INSTITUTIONS", "CONTACT_BAND"], required: ["SERVICES_INDEX"] },
  CAREERS: {
    allowed: ["SIGN", "JOBS_LIST", "RICH_TEXT", "CONTACT_BAND"],
    max: { RICH_TEXT: 2 },
    required: ["JOBS_LIST"],
  },
  CONTACT: { allowed: ["SIGN", "CONTACT_DETAILS", "FORM"], required: ["CONTACT_DETAILS", "FORM"] },
  QUOTE: { allowed: ["SIGN", "FORM"], required: ["FORM"] },
  PRIVACY: { allowed: ["SIGN", "RICH_TEXT"], max: { RICH_TEXT: 12 }, required: ["RICH_TEXT"] },
  TERMS: { allowed: ["SIGN", "RICH_TEXT"], max: { RICH_TEXT: 12 }, required: ["RICH_TEXT"] },
};

/** The orderings kept as documents (plan D59). */
export const ORDERED_COLLECTIONS = ["SERVICES", "CLIENTS"] as const;
export type OrderedCollection = (typeof ORDERED_COLLECTIONS)[number];

/** Every keyed document (plan D60): each page, the site's content, each ordering. */
export const pageDocumentKey = (page: PageKey) => `PAGE:${page}` as const;
export const orderingDocumentKey = (collection: OrderedCollection) => `ORDER:${collection}` as const;
export const SITE_DOCUMENT_KEY = "SITE";

export const DOCUMENT_KEYS: readonly string[] = [
  ...PAGE_KEYS.map(pageDocumentKey),
  SITE_DOCUMENT_KEY,
  ...ORDERED_COLLECTIONS.map(orderingDocumentKey),
];
export type DocumentKey =
  ReturnType<typeof pageDocumentKey> | ReturnType<typeof orderingDocumentKey> | typeof SITE_DOCUMENT_KEY;
