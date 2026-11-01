import { describe, expect, it } from "vitest";

import { PAGE_KEYS } from "@/constants/sections";
import { SEED_SERVICES, SEED_SITE, seedJob, seedPages, seedServices } from "@/db/seed/content";
import { NO_PHOTOS, SEED_PHOTOS } from "@/db/seed/photos";
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

  it("gives each service the current site's own photograph once imported, and none before (D102, D118)", () => {
    expect(seedServices().every((service) => service.image === null)).toBe(true);
    const refs = Object.fromEntries(Object.keys(SEED_PHOTOS).map((name) => [name, { mediaId: name }]));
    const services = seedServices(refs as never);
    expect(services.map((service) => service.image?.mediaId)).toEqual([
      "currentStaffingTeam",
      "currentSchoolNurse",
      "currentHomeCare",
      "currentBedsideCare",
      "currentBabyCheck",
      "currentMaternityWard",
      "currentComfortingHands",
      "currentHelpingUp",
    ]);
    expect(seedServices({ ...NO_PHOTOS }).map((service) => service.slug)).toEqual(SEED_SERVICES.map((s) => s.slug));
  });

  it("opens Home as Theme 6: the current site's five slides, About, the services, the clients and the short quote (D128 – D133)", () => {
    const home = seedPages().HOME;
    expect(home.sections.map((section) => section.type)).toEqual(["SIGN", "INTRO", "SERVICES_ROW", "CLIENTS", "FORM"]);
    const [sign, intro, , , form] = home.sections;
    if (sign.type !== "SIGN" || intro.type !== "INTRO" || form.type !== "FORM")
      throw new Error("Home's sections moved");
    expect(sign.content.slides).toHaveLength(5);
    expect(sign.content.slides.every((slide) => slide.buttonLabel.en === null && slide.buttonHref.en === null)).toBe(
      true,
    );
    expect(intro.content.points).toHaveLength(3);
    expect(form.content.form).toBe("SHORT_QUOTE");
  });

  it("puts Home first in the menu (D132)", () => {
    expect(SEED_SITE.navigation[0]).toMatchObject({ href: "/", visible: true });
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
