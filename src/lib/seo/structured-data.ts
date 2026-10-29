import { ROUTES } from "@/constants/routes";
import type { ServiceDocument, SiteDocument } from "@/lib/validation";

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
