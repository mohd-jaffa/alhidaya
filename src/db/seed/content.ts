import { ROUTES } from "@/constants/routes";
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

/** Faces that are there: a photograph not imported yet is left out. */
const faces = (...refs: ({ mediaId: string } | null)[]) =>
  refs.filter((ref): ref is { mediaId: string } => ref !== null);

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
      // The reference's sections (D97), in its order, in the company's own facts (D7, D99).
      sections: [
        sign({
          headline: en("Quality nursing care at your doorstep"),
          highlight: en("nursing care"),
          lede: en(
            "Nursing care at home and in clinics across Doha, and nurse staffing for hospitals, clinics and schools.",
          ),
          image: photos.avatarBraids,
          avatars: faces(photos.avatarNavy, photos.heroNurse, photos.avatarGreen, photos.avatarTurban),
          chips: [en("At home"), en("Day and night"), en("Across Doha")],
          card: { title: en("Home nursing care"), tag: en("Our services"), image: photos.homeNursing },
          note: { pictogram: "clock", text: en("Nurses around the clock") },
          fact: { value: en("24/7"), label: en("Nurses around the clock") },
        }),
        section("STATEMENT", {
          parts: [
            { text: en("We bring"), strong: false, pictogram: null },
            { text: en("quality nursing care"), strong: true, pictogram: "careAtHome" },
            { text: en("to your doorstep, and"), strong: false, pictogram: null },
            { text: en("nurse staffing"), strong: true, pictogram: "staffing" },
            { text: en("to"), strong: false, pictogram: null },
            { text: en("hospitals, clinics and schools"), strong: true, pictogram: "heart" },
            { text: en("across Doha."), strong: false, pictogram: null },
          ],
        }),
        section("HIGHLIGHTS", {
          // The current site's slides (2026-10-31): their sentences carried into Home's headings.
          note: {
            pictogram: "shield",
            title: en("Affordable nursing care, without compromising quality"),
            text: en("Nursing care at home and in clinics, for families and for institutions across Doha."),
          },
          first: { image: photos.laughingCare, label: en("Care at home") },
          accent: {
            title: en("Two businesses under one roof"),
            text: en("Home care for families, and nurse staffing for hospitals, clinics and schools."),
            avatars: faces(photos.avatarTurban, photos.avatarGreen, photos.avatarNavy),
            fact: { value: en("8"), label: en("Services") },
          },
          second: { image: photos.nursesTalking, label: en("Nurse staffing") },
        }),
        section("FOR_INSTITUTIONS", {
          label: en("For hospitals, clinics & schools"),
          headingStart: en("Trained nurses who deliver"),
          pictogram: "staffing",
          headingEnd: en("excellence every time"),
          team: {
            title: en("Nurses for your team"),
            text: en("Tell us the roles you need to fill, and we will prepare a quote."),
            avatars: faces(
              photos.avatarGreen,
              photos.avatarBraids,
              photos.avatarNavy,
              photos.avatarTurban,
              photos.heroNurse,
            ),
          },
          photo: { image: photos.wardNurse, text: en("Nurses for hospital wards, clinics and school rooms.") },
          reach: {
            title: en("Across Doha, day and night"),
            avatars: faces(photos.avatarNavy, photos.avatarGreen, photos.avatarTurban, photos.avatarBraids),
          },
          facts: [
            { value: en("24/7"), label: en("Nurses around the clock") },
            { value: en("8"), label: en("Nursing services") },
            { value: en("Doha"), label: en("Homes, hospitals, clinics and schools") },
          ],
        }),
        section("FOR_FAMILIES", {
          label: en("For families"),
          headingStart: en("Compassionate nursing care"),
          pictogram: "heart",
          headingEnd: en("for your loved ones"),
          // How it works runs through the families' card (D124).
          stepsLabel: en("How it works"),
          steps: [
            {
              image: photos.onThePhone,
              title: en("Tell us what you need"),
              text: en("Call us, message us on WhatsApp, or send a request."),
            },
            {
              image: photos.consultation,
              title: en("We talk it through"),
              text: en("We ask about the person, the care they need and the hours."),
            },
            {
              image: photos.avatarNavy,
              title: en("We agree a care plan"),
              text: en("A plan that fits the patient's needs and the family's budget."),
            },
            {
              image: photos.careAtHome,
              title: en("Care begins"),
              text: en("At home, in the clinic, or on your ward."),
            },
          ],
          photo: { image: photos.elderlyCare, text: en("A nurse comes to your home, so care fits your family's day.") },
          features: [
            { pictogram: "clock", title: en("Day and night") },
            { pictogram: "chat", title: en("On WhatsApp") },
            { pictogram: "careAtHome", title: en("At your doorstep") },
          ],
        }),
        section("SERVICES_ROW", {
          label: en("Our services"),
          headingStart: en("Nursing care"),
          pictogram: "stethoscope",
          headingEnd: en("for every need"),
        }),
        section("FORM", {
          heading: en("Experience the difference with Al Hidaya"),
          text: en("Write to us and we will reply. For anything urgent, call or message us on WhatsApp."),
          form: "CONTACT",
        }),
        section("CLIENTS", { heading: en("Our clients") }),
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
              "When you apply for a job: your name, email address, phone number, your answers about your licence, Dataflow, Prometric and experience, your note, and your CV.",
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

/** The photograph each seeded service shows (D102): in the families' card and on its own page. */
const SERVICE_PHOTOS: Record<string, SeedPhoto> = {
  "hospital-and-clinic-staffing": "hospitalCorridor",
  "school-nurse-staffing": "schoolNurse",
  "home-nursing-care": "homeNursing",
  "chronic-condition-care": "chronicCare",
  "child-care": "childCare",
  "maternity-and-newborn-care": "newbornCare",
  "palliative-care": "palliativeCare",
  "elderly-care": "elderlyCare",
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
    { label: en("About"), href: ROUTES.about, visible: true },
    { label: en("Services"), href: ROUTES.services, visible: true },
    { label: en("Careers"), href: ROUTES.careers, visible: true },
    { label: en("Contact"), href: ROUTES.contact, visible: true },
  ],
  runningWords: en("AL HIDAYA HEALTH CARE"),
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
