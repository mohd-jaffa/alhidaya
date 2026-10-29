import { describe, expect, it } from "vitest";

import { breadcrumbs, jsonLd, medicalBusiness, serviceData } from "@/lib/seo/structured-data";
import { serviceFixture, siteFixture } from "@tests/support/fixtures/content";

const SITE = "https://alhidaya.qa";
const en = <T>(value: T) => ({ en: value });

describe("medicalBusiness", () => {
  it("describes the company from the published site content, open 24/7 while the site says so", () => {
    const site = siteFixture();
    expect(
      medicalBusiness({ ...site, contact: { ...site.contact, mapPin: { lat: 25.28, lon: 51.49 } } }, SITE),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": "https://alhidaya.qa/#business",
      name: "Al Hidaya Health Care Services",
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
