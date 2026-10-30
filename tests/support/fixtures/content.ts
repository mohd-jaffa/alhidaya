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
    headline: en("Nursing care, at your doorstep"),
    highlight: en(null),
    lede: en(null),
    image: null,
    ...NO_HERO,
  },
  INTRO: {
    heading: en("Who we are"),
    body: [{ type: "paragraph", text: en("A nursing company in Doha.") }],
    image: null,
  },
  SERVICES_INDEX: { heading: en("Services"), intro: en(null) },
  VALUES: { heading: en("Why us"), items: [{ title: en("Day and night"), text: en(null) }] },
  MISSION: { mission: en("Our mission."), vision: en("Our vision.") },
  INSTITUTIONS: { heading: en("For institutions"), text: en("Nurse staffing."), image: null },
  CLIENTS: { heading: en("Our clients") },
  CAREERS_BAND: { heading: en("Join us"), text: en(null) },
  JOBS_LIST: { intro: en(null), emptyText: en("No openings right now.") },
  CONTACT_BAND: { heading: en("Talk to us"), text: en(null) },
  CONTACT_DETAILS: { heading: en("Contact") },
  FORM: { heading: en("Send a message"), text: en(null), form: "CONTACT" },
  RICH_TEXT: { heading: en(null), body: [{ type: "paragraph", text: en("Text.") }] },
  STATEMENT: {
    parts: [
      { text: en("We bring"), strong: false, pictogram: null },
      { text: en("nursing care"), strong: true, pictogram: "heart" },
    ],
  },
  HIGHLIGHTS: {
    note: { pictogram: "globe", title: en("Across Doha"), text: en("Care at home and in clinics.") },
    first: { image: null, label: en("Care at home") },
    accent: {
      title: en("Two businesses"),
      text: en(null),
      avatars: [],
      fact: { value: en("8"), label: en("Services") },
    },
    second: { image: null, label: en(null) },
  },
  FOR_INSTITUTIONS: {
    label: en("For institutions"),
    headingStart: en("Nurse staffing for"),
    pictogram: "staffing",
    headingEnd: en("hospitals and schools"),
    team: { title: en("Nurses for your team"), text: en(null), avatars: [] },
    photo: { image: null, text: en(null) },
    reach: { title: en("Across Doha"), avatars: [] },
    facts: [{ value: en("24/7"), label: en("Nurses around the clock") }],
  },
  FOR_FAMILIES: {
    label: en("For families"),
    headingStart: en("Care for the people you love,"),
    pictogram: "heart",
    headingEnd: en("at home."),
    photo: { image: null, text: en(null) },
    features: [{ pictogram: "clock", title: en("Day and night") }],
  },
  PROCESS: {
    label: en("How it works"),
    headingStart: en("Care arranged"),
    pictogram: null,
    headingEnd: en(null),
    steps: [
      { image: null, title: en("Tell us what you need"), text: en(null) },
      { image: null, title: en("Care begins"), text: en(null) },
    ],
  },
};

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
  return { seo, sections: types[page].map((type) => section(type)) };
}

export const serviceFixture = (overrides: Partial<ServiceDocument> = {}): ServiceDocument => ({
  name: en("Home nursing care"),
  slug: "home-nursing-care",
  audience: "FAMILIES",
  summary: en("Qualified nurses at home."),
  description: [{ type: "paragraph", text: en("Care at home.") }],
  included: [en("Medication management")],
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
  name: en("Al Hidaya Health Care Services"),
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
  runningWords: en("AL HIDAYA HEALTH CARE"),
  footer: [{ heading: en("Company"), links: [{ label: en("About"), href: "/about" }] }],
  seo: { title: en("Al Hidaya Health Care Services"), description: en("Nursing care in Doha.") },
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
