import { ROUTES } from "@/constants/routes";
import { UI_TEXT } from "@/constants/messages";
import { GOOGLE_MAPS } from "@/constants/site";
import type { PageKey, SectionType } from "@/constants/sections";
import {
  type JobDocument,
  NO_HERO,
  type PageDocument,
  type Section,
  type ServiceDocument,
  type SiteDocument,
} from "@/lib/validation";

import { NO_PHOTOS, type SeedPhoto, type SeedPhotoRefs } from "./photos";

/**
 * The current site's content (alhidaya.qa, read 2026-10-28), rewritten in
 * plain professional English from the company's own facts (plan D6) as
 * drafts for the client to approve (R3.1). Nothing here is invented: no
 * statistics, licences or testimonials (D7); "what's included" stays empty
 * until the client confirms it for each service (Q9). For local development
 * (AGENTS.md §13).
 */

const en = <T>(value: T) => ({ en: value });
const paragraph = (text: string) => ({ type: "paragraph" as const, text: en(text) });
const heading = (text: string) => ({ type: "heading" as const, text: en(text) });
const list = (...items: string[]) => ({ type: "list" as const, items: items.map(en) });
const noSeo = { title: en(null), description: en(null) };

const section = <T extends SectionType>(type: T, content: Extract<Section, { type: T }>["content"]): Section =>
  ({ id: crypto.randomUUID(), type, visible: true, content }) as Section;

/** One of Home's slides (D128): with no button at launch; the admin may give it one. */
const slide = (image: { mediaId: string } | null, headline: string, highlight: string, text: string) => ({
  image,
  headline: en(headline),
  highlight: en(highlight),
  text: en(text),
  buttonLabel: en(null),
  buttonHref: en(null),
});

type SignContent = Extract<Section, { type: "SIGN" }>["content"];
type HeroParts = Pick<SignContent, keyof typeof NO_HERO>;

/** A page's sign: Home's hero holds more (D97), every other page's leaves it empty. */
const sign = (content: Omit<SignContent, keyof HeroParts> & Partial<HeroParts>): Section =>
  section("SIGN", { ...NO_HERO, ...content });

const contactBand = () =>
  section("CONTACT_BAND", {
    heading: en("Talk to us"),
    text: en("Message us on WhatsApp or call us, at any hour of the day or night."),
  });

const institutions = (image: { mediaId: string } | null) =>
  section("INSTITUTIONS", {
    heading: en("Nurse staffing for hospitals, clinics and schools"),
    text: en(
      "We supply nurses to hospitals, clinics and schools in Qatar. Tell us the roles you need to fill and we will prepare a quote.",
    ),
    image,
  });

/** Each page with its sections in the order plan §6 gives, with the seed's photographs once imported (D75). */
export function seedPages(photos: SeedPhotoRefs = NO_PHOTOS): Record<PageKey, PageDocument> {
  return {
    HOME: {
      seo: noSeo,
      // Theme 6 (D128 – D133): the slides, About, the services, the clients and the short quote.
      sections: [
        sign({
          headline: en("Quality nursing care at your doorstep"),
          highlight: en(null),
          lede: en(null),
          image: null,
          // The current site's five slides (2026-10-31), their words rewritten (D6), each with its own photo.
          slides: [
            slide(
              photos.currentHomeVisit,
              "Quality nursing care at your doorstep.",
              "nursing care",
              "Highly trained nurses giving compassionate care to patients at home and in clinics, with a plan made for each one.",
            ),
            slide(
              photos.currentThumbsUp,
              "Experience the difference with Al Hidaya.",
              "Al Hidaya.",
              "Dedicated nurses, available around the clock, caring for your loved ones with compassion.",
            ),
            slide(
              photos.currentHoldingHands,
              "Compassionate nursing care for your loved ones.",
              "loved ones.",
              "Top-quality care at home and in clinics, given with dignity and respect.",
            ),
            slide(
              photos.currentWardRound,
              "Affordable nursing care, without compromise.",
              "without compromise.",
              "Comprehensive care at home and in clinics, more affordable than a stay in hospital.",
            ),
            slide(
              photos.currentBloodPressure,
              "Trained nurses who deliver excellence every time.",
              "excellence",
              "Skilled, experienced nurses across a range of services, for families and institutions.",
            ),
          ],
          note: { pictogram: "clock", text: en("Nurses around the clock") },
        }),
        section("INTRO", {
          heading: en("About Al Hidaya Health Care Service"),
          highlight: en("Al Hidaya Health Care Service"),
          body: [
            paragraph(
              "Al Hidaya is a growing nursing care company in Doha, Qatar. We provide nursing care at home and in clinics, and supply nurses to hospitals, clinics and schools.",
            ),
            paragraph(
              "Our knowledgeable, compassionate nurses work with each patient and family on a care plan that fits their needs and their budget.",
            ),
          ],
          image: null,
          points: [
            { title: en("Committed to our patients"), text: en("Care given with compassion, respect and dignity.") },
            { title: en("Committed to leadership"), text: en("Growing through our people and our clients.") },
            { title: en("Committed to excellence"), text: en("Holding our care to the highest standard.") },
          ],
        }),
        section("SERVICES_ROW", {
          heading: en("What we do"),
          text: en("Nursing care for families at home, and nurse staffing for hospitals, clinics and schools."),
        }),
        section("CLIENTS", { heading: en("Our clients") }),
        section("FORM", {
          heading: en("Get a free quote for the care you need"),
          text: en("Tell us who the care is for and when you need it. We reply quickly, at any hour."),
          form: "SHORT_QUOTE",
        }),
      ],
    },
    ABOUT: {
      seo: noSeo,
      sections: [
        sign({
          headline: en("Nursing care with compassion and dignity"),
          highlight: en("compassion"),
          lede: en("A nursing care company in Doha, caring for patients at home and supplying nurses to institutions."),
          image: photos.careAtHome,
        }),
        section("INTRO", {
          heading: en("Who we are"),
          body: [
            paragraph(
              "Al Hidaya Health Care Service is a growing nursing care company in Doha, Qatar. We provide nursing care at home and in clinics, and supply nurses to hospitals, clinics and schools.",
            ),
            paragraph(
              "Our knowledgeable, compassionate nurses work with each patient and family on a care plan that fits their needs and their budget, and they are available around the clock.",
            ),
          ],
          image: photos.clinicCheck,
          highlight: en(null),
          points: [],
        }),
        section("MISSION", {
          mission: en(
            "To deliver nursing care of the highest quality, fitted to each patient, and to exceed the expectations of the patients, families and institutions we serve.",
          ),
          vision: en(
            "To be a trusted provider of compassionate nursing care in Qatar, known for honesty, integrity and respect for every culture and choice.",
          ),
        }),
        section("VALUES", {
          heading: en("What we stand for"),
          items: [
            {
              title: en("Committed to our patients"),
              text: en("We care for the sick with compassion and respect, and treat every patient with dignity."),
            },
            {
              title: en("Committed to leadership"),
              text: en("We grow our services through our people and the relationships we build with our clients."),
            },
            {
              title: en("Committed to excellence"),
              text: en("We hold our care to the highest standard, and aim to exceed what our clients expect."),
            },
          ],
        }),
        section("CLIENTS", { heading: en("Our clients") }),
        contactBand(),
      ],
    },
    SERVICES: {
      seo: noSeo,
      sections: [
        sign({
          headline: en("Care at home, and nurses for institutions"),
          highlight: en("Care at home"),
          lede: en("Nursing care for families across Doha, and nurse staffing for hospitals, clinics and schools."),
          image: photos.wardNurse,
        }),
        section("SERVICES_INDEX", { heading: en("All services"), intro: en(null) }),
        institutions(photos.consultation),
        contactBand(),
      ],
    },
    CAREERS: {
      seo: noSeo,
      sections: [
        sign({
          headline: en("Nursing careers in Doha"),
          highlight: en("careers"),
          lede: en("Join a team that cares for patients at home across Doha."),
          image: photos.nursesTalking,
        }),
        section("JOBS_LIST", {
          intro: en("Each opening lists what it asks for. If none fits, you can send us a general application."),
          emptyText: en("There are no openings right now. You can still send us a general application."),
          image: photos.currentStaffingTeam,
        }),
        // What the application form asks (plan §6.5, §9.2): the site's own facts, never a claim about nursing in Qatar.
        section("RICH_TEXT", {
          heading: en("Before you apply"),
          body: [
            paragraph("Each opening lists the qualifications and experience it asks for. When you apply, we ask for:"),
            list(
              "Your CV, as a PDF or Word file of up to 5 MB.",
              "Where you are with your MOPH licence, Dataflow and Prometric.",
              "Your years of nursing experience.",
            ),
          ],
        }),
      ],
    },
    CONTACT: {
      seo: noSeo,
      sections: [
        sign({
          headline: en("We are here day and night"),
          highlight: en("day and night"),
          lede: en("Message us on WhatsApp, call, email, or visit our office in Al Sadd."),
          image: photos.onThePhone,
        }),
        section("CONTACT_DETAILS", { heading: en("Reach us") }),
        section("FORM", { heading: en("Send us a message"), text: en(null), form: "CONTACT" }),
      ],
    },
    QUOTE: {
      seo: noSeo,
      sections: [
        sign({
          headline: en("Tell us the care you need"),
          highlight: en("the care"),
          lede: en("For families, hospitals, clinics and schools. We will reply with a quote."),
          image: null,
        }),
        section("FORM", { heading: en("Your request"), text: en(null), form: "QUOTE" }),
      ],
    },
    PRIVACY: {
      seo: noSeo,
      sections: [
        sign({ headline: en("Privacy notice"), highlight: en(null), lede: en(null), image: null }),
        section("RICH_TEXT", {
          heading: en(null),
          body: [
            paragraph(
              "This notice explains what Al Hidaya Health Care Service collects through this website, why, where it is kept and for how long.",
            ),
            heading("What we collect"),
            list(
              "When you send the Contact or Request a Quote form: your name, phone number, email address and what you tell us, including your organisation and the care you need when you give them.",
              "When you apply for a job: your name, email, phone number, your answers about your licence, Dataflow, Prometric, experience and the job's own questions, your note, and your CV.",
            ),
            heading("Why we collect it"),
            paragraph(
              "To answer your message, to prepare the quote you asked for, and to consider your application. We do not use it for anything else, and we do not sell it.",
            ),
            heading("Where it goes"),
            list(
              "Your details are stored on our own web server and in its database.",
              "Each submission is emailed to our team's mailboxes, which are hosted by Microsoft 365. A job application's email carries your CV.",
              "Cloudflare checks that a form is sent by a person and not a bot, and counts visits to the site without cookies.",
            ),
            heading("How long we keep it"),
            paragraph(
              "Enquiries and applications are deleted automatically after a period we set, never longer than one year. CVs may be deleted sooner. Your IP address is kept only as a scrambled code, for a few minutes, to stop repeated submissions.",
            ),
            heading(UI_TEXT.mapPrivacyHeading),
            paragraph(UI_TEXT.mapPrivacyText),
            { type: "link", label: en(UI_TEXT.mapPrivacyLink), href: GOOGLE_MAPS.privacy },
            heading("Your choices"),
            paragraph(
              "To see, correct or delete what we hold about you, email info@alhidaya.qa and we will reply as soon as we can.",
            ),
          ],
        }),
      ],
    },
    TERMS: {
      seo: noSeo,
      sections: [
        sign({ headline: en("Terms of use"), highlight: en(null), lede: en(null), image: null }),
        section("RICH_TEXT", {
          heading: en(null),
          body: [
            paragraph(
              "These terms apply to your use of this website, run by Al Hidaya Health Care Service in Doha, Qatar.",
            ),
            heading("Information on this site"),
            paragraph(
              "The information here describes our services. It is not medical advice. For advice about a condition, speak to a doctor.",
            ),
            heading("Quotes and care"),
            paragraph(
              "A quote request or a message does not book care. Care is arranged only once we have agreed it with you.",
            ),
            heading("Links to other sites"),
            paragraph("Links to other websites, such as maps and social media, are there for convenience."),
            heading("Changes"),
            paragraph("We may update these terms. The version on this page is the one that applies."),
            heading("Contact"),
            paragraph("Questions about these terms can be sent to info@alhidaya.qa."),
          ],
        }),
      ],
    },
  };
}

const service = (
  name: string,
  slug: string,
  audience: ServiceDocument["audience"],
  summary: string,
  description: string[],
  forWhom: string,
): ServiceDocument => ({
  name: en(name),
  slug,
  audience,
  summary: en(summary),
  description: description.map(paragraph),
  included: [],
  headerButtons: [],
  forWhom: en(forWhom),
  image: null,
  seo: noSeo,
});

/** The current site's eight services, in its order (plan §8, Q9); the old slugs redirect (R3.7). */
export const SEED_SERVICES: readonly ServiceDocument[] = [
  service(
    "Nurse staffing for hospitals and clinics",
    "hospital-and-clinic-staffing",
    "INSTITUTIONS",
    "Nurses for hospitals and clinics in Qatar, supplied to the roles you need to fill.",
    [
      "We supply nurses to hospitals and clinics in Qatar. Tell us the roles and the number of nurses you need, and we will prepare a quote.",
    ],
    "Hospitals and clinics in Qatar.",
  ),
  service(
    "School nurse staffing",
    "school-nurse-staffing",
    "INSTITUTIONS",
    "A nurse for your school, looking after pupils' health through the school day.",
    ["We supply nurses to schools in Qatar. Tell us about your school and we will prepare a quote."],
    "Schools in Qatar.",
  ),
  service(
    "Home nursing care",
    "home-nursing-care",
    "FAMILIES",
    "Compassionate, reliable nurses who care for you or your family at home.",
    [
      "Our home care nurses give personal care in the comfort of your home, helping each patient stay independent and live well.",
      "We agree a care plan with you that fits your needs and your budget.",
    ],
    "Anyone who needs nursing care at home.",
  ),
  service(
    "Chronic condition care",
    "chronic-condition-care",
    "FAMILIES",
    "Ongoing nursing care at home for people living with a long-term illness.",
    [
      "Our nurses care for people living with a long-term illness at home, following a care plan agreed with the patient and their family.",
    ],
    "People living with a long-term illness, and their families.",
  ),
  service(
    "Child care",
    "child-care",
    "FAMILIES",
    "Nursing care for children, at home.",
    ["Our nurses care for children at home, with a care plan agreed with the family."],
    "Families with a child who needs nursing care.",
  ),
  service(
    "Maternity and newborn care",
    "maternity-and-newborn-care",
    "FAMILIES",
    "Care at home for mothers and their newborn babies.",
    ["Our nurses care for mothers and their newborn babies at home, with a care plan agreed with the family."],
    "New mothers and their families.",
  ),
  service(
    "Palliative care",
    "palliative-care",
    "FAMILIES",
    "Comfort, dignity and compassionate nursing care at home for people with a serious illness.",
    [
      "Our nurses care for people with a serious illness at home, with compassion and respect for the patient's wishes and their family's.",
    ],
    "People with a serious illness, and their families.",
  ),
  service(
    "Elderly care",
    "elderly-care",
    "FAMILIES",
    "Nursing care at home for older people, given with respect and dignity.",
    [
      "Our nurses care for older people at home, helping them stay independent, with a care plan agreed with the family.",
    ],
    "Older people and their families.",
  ),
];

/** The photograph each seeded service shows (D102): the current site's own (D118), on Home's cards and its page. */
const SERVICE_PHOTOS: Record<string, SeedPhoto> = {
  "hospital-and-clinic-staffing": "currentStaffingTeam",
  "school-nurse-staffing": "currentSchoolNurse",
  "home-nursing-care": "currentHomeCare",
  "chronic-condition-care": "currentBedsideCare",
  "child-care": "currentBabyCheck",
  "maternity-and-newborn-care": "currentMaternityWard",
  "palliative-care": "currentComfortingHands",
  "elderly-care": "currentHelpingUp",
};

/** The services with their photographs, once imported (D102). */
export function seedServices(photos: SeedPhotoRefs = NO_PHOTOS): ServiceDocument[] {
  return SEED_SERVICES.map((service) => ({ ...service, image: photos[SERVICE_PHOTOS[service.slug]] ?? null }));
}

/**
 * The current posting (plan §9.1). The old site gives no employment type and
 * a garbled posting date, so both are drafts for the client to confirm (R3.1).
 */
export function seedJob(postedOn: string): JobDocument {
  return {
    title: en("Registered General Nurse – Home Care"),
    slug: "registered-general-nurse-home-care",
    department: en(null),
    location: en("Doha, Qatar"),
    employmentType: "FULL_TIME",
    experience: en("At least 2 years of adult nursing experience"),
    summary: en("Care for adult patients in their homes across Doha."),
    description: [],
    responsibilities: [],
    qualifications: [
      en("A Bachelor's degree or Diploma in Nursing"),
      en("At least 2 years of nursing experience with adult patients"),
      en("A valid nursing registration in your home country, or an MOPH licence"),
      en("Dataflow and Prometric"),
      en("Strong communication and organisational skills"),
    ],
    benefits: [],
    questions: [],
    postedOn,
    closesOn: null,
    closed: false,
    seo: noSeo,
  };
}

/** The site's content (plan §13), from the current site's contact details. */
export const SEED_SITE: SiteDocument = {
  name: en("Al Hidaya Health Care Service"),
  description: en(
    "Nursing care at home and in clinics, and nurse staffing for hospitals, clinics and schools, in Doha, Qatar.",
  ),
  contact: {
    phone: "+97431306555",
    whatsapp: "+97431306555",
    email: "info@alhidaya.qa",
    address: [
      en("Retaj Building, Bin Naifaa 80"),
      en("Near Asmakh Mall"),
      en("First floor, door 109"),
      en("Al Sadd, Doha, Qatar"),
    ],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Retaj+Building+Al+Sadd+Doha",
    // The office's exact spot waits for the client (D74): until then the map marks only Asmakh Mall.
    mapPin: null,
    hours: en("Available 24/7"),
  },
  social: [{ network: "INSTAGRAM", url: "https://www.instagram.com/alhidayanursingcompany_wll" }],
  navigation: [
    { label: en("Home"), href: ROUTES.home, visible: true },
    { label: en("About"), href: ROUTES.about, visible: true },
    { label: en("Services"), href: ROUTES.services, visible: true },
    { label: en("Careers"), href: ROUTES.careers, visible: true },
    { label: en("Contact"), href: ROUTES.contact, visible: true },
  ],
  footer: [
    {
      heading: en("Company"),
      links: [
        { label: en("About"), href: ROUTES.about },
        { label: en("Services"), href: ROUTES.services },
        { label: en("Careers"), href: ROUTES.careers },
        { label: en("Contact"), href: ROUTES.contact },
        { label: en("Request a quote"), href: ROUTES.quote },
      ],
    },
    {
      heading: en("Legal"),
      links: [
        { label: en("Privacy"), href: ROUTES.privacy },
        { label: en("Terms"), href: ROUTES.terms },
      ],
    },
  ],
  seo: {
    title: en("Al Hidaya Health Care Service | Nursing care in Doha"),
    description: en(
      "Nursing care at home in Doha, and nurse staffing for hospitals, clinics and schools. Our nurses are available 24/7.",
    ),
  },
  brochure: null,
  // On every page, as on today's site; the admin can turn it off (D67).
  whatsappButton: true,
};
