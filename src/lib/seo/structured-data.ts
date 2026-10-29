import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { EmploymentType } from "@/constants/statuses";
import { SITE_TIME_ZONE_OFFSET } from "@/lib/dates";
import type { JobDocument, RichText, ServiceDocument, SiteDocument } from "@/lib/validation";

/** Structured data for search engines (plan §19): plain schema.org objects, written into the page as JSON-LD. */
export type StructuredData = Record<string, unknown>;

/** The company itself (plan §19): who, where, how to reach it, and when, from the published site content. */
export function medicalBusiness(site: SiteDocument, siteUrl: string): StructuredData {
  const { contact } = site;
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${siteUrl}/#business`,
    name: site.name.en,
    description: site.description.en,
    url: siteUrl,
    logo: `${siteUrl}/apple-icon.png`,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.map((line) => line.en).join(", "),
      addressLocality: "Doha",
      addressCountry: "QA",
    },
    ...(contact.mapPin
      ? { geo: { "@type": "GeoCoordinates", latitude: contact.mapPin.lat, longitude: contact.mapPin.lon } }
      : {}),
    // Only while the site says so: the company's own claim (plan §6.7).
    ...(contact.hours.en && /24\s*\/\s*7/.test(contact.hours.en) ? { openingHours: "Mo-Su 00:00-23:59" } : {}),
    ...(site.social.length > 0 ? { sameAs: site.social.map((social) => social.url) } : {}),
  };
}

/** A service (plan §19), offered by the company. */
export function serviceData(service: ServiceDocument, siteUrl: string): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name.en,
    description: service.summary.en,
    url: `${siteUrl}${ROUTES.service(service.slug)}`,
    areaServed: { "@type": "City", name: "Doha" },
    provider: { "@id": `${siteUrl}/#business` },
  };
}

/** Google's words for a job's terms (plan §9.1). */
const EMPLOYMENT: Record<EmploymentType, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const htmlList = (items: readonly { en: string }[]) =>
  `<ul>${items.map((item) => `<li>${escapeHtml(item.en)}</li>`).join("")}</ul>`;

function htmlBlocks(blocks: RichText): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h3>${escapeHtml(block.text.en)}</h3>`;
        case "paragraph":
          return `<p>${escapeHtml(block.text.en)}</p>`;
        case "list":
          return htmlList(block.items);
        case "link":
          return `<p>${escapeHtml(block.label.en)}</p>`;
      }
    })
    .join("");
}

/**
 * The job as Google reads a posting (plan §19): its description in plain
 * HTML, every word escaped, from the job's own parts under the page's own
 * headings; open until the end of its closing day in Doha. Only for an open
 * job.
 */
export function jobPosting(job: JobDocument, siteUrl: string): StructuredData {
  const parts: [string, readonly { en: string }[]][] = [
    [UI_TEXT.responsibilities, job.responsibilities],
    [UI_TEXT.qualifications, job.qualifications],
    [UI_TEXT.benefits, job.benefits],
  ];
  const description = [
    `<p>${escapeHtml(job.summary.en)}</p>`,
    htmlBlocks(job.description),
    ...parts.filter(([, items]) => items.length > 0).map(([title, items]) => `<h3>${title}</h3>${htmlList(items)}`),
  ].join("");
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title.en,
    description,
    datePosted: job.postedOn,
    ...(job.closesOn ? { validThrough: `${job.closesOn}T23:59:59${SITE_TIME_ZONE_OFFSET}` } : {}),
    employmentType: EMPLOYMENT[job.employmentType],
    hiringOrganization: {
      "@type": "Organization",
      name: UI_TEXT.siteName,
      sameAs: siteUrl,
      logo: `${siteUrl}/apple-icon.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location.en, addressCountry: "QA" },
    },
    directApply: true,
    url: `${siteUrl}${ROUTES.job(job.slug)}`,
  };
}

/** Where a page sits under Home (plan §19). */
export function breadcrumbs(trail: readonly { name: string; path: string }[], siteUrl: string): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${siteUrl}${step.path === "/" ? "" : step.path}`,
    })),
  };
}

/** JSON for a script tag: nothing in the data can close the tag or open another. */
export function jsonLd(data: StructuredData): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
