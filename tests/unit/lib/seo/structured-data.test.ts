import { describe, expect, it } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { breadcrumbs, jobPosting, jsonLd, medicalBusiness, serviceData } from "@/lib/seo/structured-data";
import { jobFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";

const SITE = "https://alhidaya.qa";
const en = <T>(value: T) => ({ en: value });

describe("medicalBusiness", () => {
  it("projects emphasis to clean schema text while contact/address values remain literal", () => {
    const site = siteFixture();
    const data = medicalBusiness(
      {
        ...site,
        name: en("**Al Hidaya**"),
        description: en("*Quality* ***care***"),
        contact: { ...site.contact, address: [en("*Literal* address")], hours: en("**24**/*7*") },
      },
      SITE,
    );
    expect(data).toMatchObject({
      name: "Al Hidaya",
      description: "Quality care",
      openingHours: "Mo-Su 00:00-23:59",
      address: { streetAddress: "*Literal* address" },
      email: site.contact.email,
      telephone: site.contact.phone,
    });
  });

  it("describes the company from the published site content, open 24/7 while the site says so", () => {
    const site = siteFixture();
    expect(
      medicalBusiness({ ...site, contact: { ...site.contact, mapPin: { lat: 25.28, lon: 51.49 } } }, SITE),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": "https://alhidaya.qa/#business",
      name: "Al Hidaya Health Care Service",
      description: "Nursing care at home and in clinics.",
      url: SITE,
      logo: "https://alhidaya.qa/apple-icon.png",
      telephone: "+97431306555",
      email: "info@alhidaya.qa",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Retaj Building, Al Sadd, Doha",
        addressLocality: "Doha",
        addressCountry: "QA",
      },
      geo: { "@type": "GeoCoordinates", latitude: 25.28, longitude: 51.49 },
      openingHours: "Mo-Su 00:00-23:59",
      sameAs: ["https://instagram.com/alhidayanursingcompany_wll"],
    });
  });

  it("claims no hours, place or profiles the site does not give", () => {
    const site = siteFixture({ social: [] });
    for (const hours of [null, "Sunday to Thursday"]) {
      const data = medicalBusiness({ ...site, contact: { ...site.contact, hours: en(hours) } }, SITE);
      expect(data).not.toHaveProperty("openingHours");
      expect(data).not.toHaveProperty("geo");
      expect(data).not.toHaveProperty("sameAs");
    }
  });
});

describe("serviceData and breadcrumbs", () => {
  it("offer a service as the company's, and place a page under Home", () => {
    expect(serviceData(serviceFixture(), SITE)).toMatchObject({
      "@type": "Service",
      name: "Home nursing care",
      url: "https://alhidaya.qa/services/home-nursing-care",
      provider: { "@id": "https://alhidaya.qa/#business" },
    });
    expect(
      breadcrumbs(
        [
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ],
        SITE,
      ).itemListElement,
    ).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://alhidaya.qa/services" },
    ]);
  });
});

describe("jobPosting", () => {
  it("posts the job as the company's, open until the end of its closing day in Doha", () => {
    const job = jobFixture({
      closesOn: "2026-11-30",
      description: [
        { type: "heading", text: en("The team") },
        { type: "paragraph", text: en("Nurses & carers <in Doha>.") },
        { type: "list", items: [en("Day shifts"), en("Night shifts")] },
        { type: "link", label: en("Our services"), href: "/services" },
      ],
      responsibilities: [en("Visit patients at home")],
      benefits: [en("Accommodation")],
    });
    expect(jobPosting(job, SITE)).toEqual({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Registered General Nurse – Home Care",
      description:
        "<p>Home care nursing.</p><h3>The team</h3><p>Nurses &amp; carers &lt;in Doha&gt;.</p>" +
        "<ul><li>Day shifts</li><li>Night shifts</li></ul><p>Our services</p>" +
        `<h3>${UI_TEXT.responsibilities}</h3><ul><li>Visit patients at home</li></ul>` +
        `<h3>${UI_TEXT.qualifications}</h3><ul><li>MOPH licence or home-country registration</li></ul>` +
        `<h3>${UI_TEXT.benefits}</h3><ul><li>Accommodation</li></ul>`,
      datePosted: "2026-10-01",
      validThrough: "2026-11-30T23:59:59+03:00",
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: "Al Hidaya Health Care Service",
        sameAs: SITE,
        logo: "https://alhidaya.qa/apple-icon.png",
      },
      jobLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: "Doha, Qatar", addressCountry: "QA" },
      },
      directApply: true,
      url: "https://alhidaya.qa/careers/registered-general-nurse-home-care",
    });
  });

  it("gives no end to a job with no closing date, and names a contract as Google does", () => {
    const data = jobPosting(jobFixture({ employmentType: "CONTRACT", qualifications: [] }), SITE);
    expect(data).not.toHaveProperty("validThrough");
    expect(data).toMatchObject({ employmentType: "CONTRACTOR", description: "<p>Home care nursing.</p>" });
  });
});

describe("jsonLd", () => {
  it("can never close its script tag or break a line in a script", () => {
    const separators = String.fromCharCode(0x2028, 0x2029);
    const written = jsonLd({ name: `</script><script>alert(1)</script>${separators}` });
    expect(written).not.toContain("<");
    expect(written).not.toContain(separators[0]);
    expect(written).not.toContain(separators[1]);
    expect(JSON.parse(written)).toEqual({ name: `</script><script>alert(1)</script>${separators}` });
  });
});
