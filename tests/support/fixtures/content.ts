import type { PageKey, SectionType } from "@/constants/sections";
import type { SiteImage } from "@/features/media/types";
import {
  type ClientDocument,
  type JobDocument,
  NO_HERO,
  type PageDocument,
  type Section,
  type ServiceDocument,
  type SiteDocument,
} from "@/lib/validation";

/** Valid content to start a test from; every value is made up for tests. */
const en = <T>(value: T) => ({ en: value });

const CONTENT: Record<SectionType, Section["content"]> = {
  SIGN: {
    showActions: false,
    hideNote: false,
    headline: en("Nursing care, at your doorstep"),
    highlight: en(null),
    lede: en(null),
    image: null,
    ...NO_HERO,
  },
  INTRO: {
    heading: en("Who we are"),
    highlight: en(null),
    body: [{ type: "paragraph", text: en("A nursing company in Doha.") }],
    image: null,
    points: [],
  },
  SERVICES_INDEX: { heading: en("Services"), intro: en(null) },
  VALUES: { heading: en("Why us"), items: [{ title: en("Day and night"), text: en(null) }] },
  MISSION: { mission: en("Our mission."), vision: en("Our vision.") },
  INSTITUTIONS: { heading: en("For institutions"), text: en("Nurse staffing."), image: null },
  CLIENTS: { heading: en("Our clients") },
  CAREERS_BAND: { heading: en("Join us"), text: en(null) },
  JOBS_LIST: { intro: en(null), emptyText: en("No openings right now."), image: null },
  CONTACT_BAND: { heading: en("Talk to us"), text: en(null) },
  CONTACT_DETAILS: { heading: en("Contact") },
  FORM: { heading: en("Send a message"), text: en(null), form: "CONTACT" },
  RICH_TEXT: { heading: en(null), body: [{ type: "paragraph", text: en("Text.") }] },
  SERVICES_ROW: { heading: en("What we do"), text: en(null) },
};

/** One of Home's slides (D128), with no button unless a test gives one. */
export const slideFixture = (
  overrides: Partial<Extract<Section, { type: "SIGN" }>["content"]["slides"][number]> = {},
) => ({
  image: null,
  headline: en("Quality nursing care at your doorstep."),
  highlight: en("nursing care"),
  text: en("Nurses who care for your loved ones at home."),
  buttonLabel: en(null),
  buttonHref: en(null),
  ...overrides,
});

export const section = (type: SectionType, visible = true): Section =>
  ({ id: crypto.randomUUID(), type, visible, content: CONTENT[type] }) as Section;

/** A section type's valid content, typed as that type's. */
export const contentFixture = <T extends SectionType>(type: T) =>
  structuredClone(CONTENT[type]) as Extract<Section, { type: T }>["content"];

const seo = { title: en(null), description: en(null) };

/** A page holding exactly the sections it needs. */
export function pageFixture(page: PageKey): PageDocument {
  const types: Record<PageKey, SectionType[]> = {
    HOME: ["SIGN", "INTRO", "SERVICES_INDEX", "CONTACT_BAND"],
    ABOUT: ["SIGN", "MISSION"],
    SERVICES: ["SIGN", "SERVICES_INDEX"],
    CAREERS: ["SIGN", "JOBS_LIST"],
    CONTACT: ["SIGN", "CONTACT_DETAILS", "FORM"],
    QUOTE: ["SIGN", "FORM"],
    PRIVACY: ["SIGN", "RICH_TEXT"],
    TERMS: ["SIGN", "RICH_TEXT"],
  };
  const sections = types[page].map((type) => section(type));
  // Home's hero shows at least one slide (D128).
  if (page === "HOME")
    sections[0] = { ...sections[0], content: { ...contentFixture("SIGN"), slides: [slideFixture()] } } as Section;
  return { seo, sections };
}

export const serviceFixture = (overrides: Partial<ServiceDocument> = {}): ServiceDocument => ({
  name: en("Home nursing care"),
  slug: "home-nursing-care",
  audience: "FAMILIES",
  summary: en("Qualified nurses at home."),
  description: [{ type: "paragraph", text: en("Care at home.") }],
  included: [en("Medication management")],
  headerButtons: [],
  forWhom: en(null),
  image: null,
  seo,
  ...overrides,
});

export const jobFixture = (overrides: Partial<JobDocument> = {}): JobDocument => ({
  title: en("Registered General Nurse – Home Care"),
  slug: "registered-general-nurse-home-care",
  department: en(null),
  location: en("Doha, Qatar"),
  employmentType: "FULL_TIME",
  experience: en("2 years"),
  summary: en("Home care nursing."),
  description: [],
  responsibilities: [],
  qualifications: [en("MOPH licence or home-country registration")],
  benefits: [],
  questions: [],
  postedOn: "2026-10-01",
  closesOn: null,
  closed: false,
  seo,
  ...overrides,
});

export const clientFixture = (overrides: Partial<ClientDocument> = {}): ClientDocument => ({
  name: en("A client"),
  logo: { mediaId: crypto.randomUUID() },
  url: null,
  ...overrides,
});

export const siteFixture = (overrides: Partial<SiteDocument> = {}): SiteDocument => ({
  name: en("Al Hidaya Health Care Service"),
  description: en("Nursing care at home and in clinics."),
  contact: {
    phone: "+97431306555",
    whatsapp: "+97431306555",
    email: "info@alhidaya.qa",
    address: [en("Retaj Building, Al Sadd, Doha")],
    mapUrl: "https://maps.google.com/?q=Retaj+Building+Al+Sadd",
    mapPin: null,
    hours: en("Available 24/7"),
  },
  social: [{ network: "INSTAGRAM", url: "https://instagram.com/alhidayanursingcompany_wll" }],
  navigation: [{ label: en("Services"), href: "/services", visible: true }],
  footer: [{ heading: en("Company"), links: [{ label: en("About"), href: "/about" }] }],
  seo: { title: en("Al Hidaya Health Care Service"), description: en("Nursing care in Doha.") },
  brochure: null,
  whatsappButton: true,
  ...overrides,
});

/** A record as the public reads it, published. */
export const publishedFixture = <T extends object>(document: T) => ({
  id: crypto.randomUUID(),
  slug: "slug" in document && typeof document.slug === "string" ? document.slug : null,
  published: document,
  publishedAt: new Date("2026-10-29T09:00:00Z"),
});

/** An image as a page shows it: one made size, in WebP. */
export const imageFixture = (alt = "A nurse at a patient's bedside"): SiteImage => ({
  id: crypto.randomUUID(),
  width: 1600,
  height: 1067,
  alt,
  sources: [{ url: "/media/2026-10/abcdefghij-w960.webp", width: 960, mime: "image/webp" }],
});
