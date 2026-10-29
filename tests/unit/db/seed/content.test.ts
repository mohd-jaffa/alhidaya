import { describe, expect, it } from "vitest";

import { PAGE_KEYS } from "@/constants/sections";
import { SEED_SERVICES, SEED_SITE, seedJob, seedPages } from "@/db/seed/content";
import { jobDocumentSchema, pageDocumentSchema, serviceDocumentSchema, siteDocumentSchema } from "@/lib/validation";

describe("the seed content", () => {
  it("gives every page a draft its page's rules accept", () => {
    const pages = seedPages();
    for (const page of PAGE_KEYS) expect(pageDocumentSchema(page).parse(pages[page])).toEqual(pages[page]);
  });

  it("gives each section a fresh id on each run", () => {
    expect(seedPages().HOME.sections[0].id).not.toBe(seedPages().HOME.sections[0].id);
  });

  it("holds the current site's eight services, in its order, each on its audience's line (plan §8)", () => {
    for (const service of SEED_SERVICES) expect(serviceDocumentSchema.parse(service)).toEqual(service);
    expect(SEED_SERVICES.map((service) => [service.slug, service.audience])).toEqual([
      ["hospital-and-clinic-staffing", "INSTITUTIONS"],
      ["school-nurse-staffing", "INSTITUTIONS"],
      ["home-nursing-care", "FAMILIES"],
      ["chronic-condition-care", "FAMILIES"],
      ["child-care", "FAMILIES"],
      ["maternity-and-newborn-care", "FAMILIES"],
      ["palliative-care", "FAMILIES"],
      ["elderly-care", "FAMILIES"],
    ]);
  });

  it("claims nothing the client has not confirmed (plan D7, Q9)", () => {
    for (const service of SEED_SERVICES) expect(service.included).toEqual([]);
    const text = JSON.stringify([seedPages(), SEED_SERVICES, SEED_SITE]);
    expect(text).not.toMatch(/\d+%|\d+\+|licensed|accredited|award|testimonial/i);
  });

  it("holds the current job, posted on the day given, open until closed", () => {
    const job = seedJob("2026-10-29");
    expect(jobDocumentSchema.parse(job)).toEqual(job);
    expect(job).toMatchObject({ slug: "registered-general-nurse-home-care", postedOn: "2026-10-29", closesOn: null });
  });

  it("holds the current site's contact details", () => {
    expect(siteDocumentSchema.parse(SEED_SITE)).toEqual(SEED_SITE);
    expect(SEED_SITE.contact).toMatchObject({
      phone: "+97431306555",
      whatsapp: "+97431306555",
      email: "info@alhidaya.qa",
    });
  });
});
