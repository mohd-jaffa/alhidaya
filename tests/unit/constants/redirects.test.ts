import { describe, expect, it } from "vitest";

import { OLD_SITE_REDIRECTS } from "@/constants/redirects";
import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES } from "@/db/seed/content";

describe("the old site's addresses (plan §5.3)", () => {
  it("each move once, to a page this site has, the catch-all last", () => {
    const sources = OLD_SITE_REDIRECTS.map((redirect) => redirect.source);
    expect(new Set(sources).size).toBe(sources.length);
    expect(sources.at(-2)).toBe("/service-detail/:slug*");
    const pages = new Set([
      ...Object.values(ROUTES).filter((route) => typeof route === "string"),
      ...SEED_SERVICES.map((service) => ROUTES.service(service.slug)),
    ]);
    for (const { destination } of OLD_SITE_REDIRECTS) expect(pages, destination).toContain(destination);
  });

  it("send each of the current site's eight services to its own page", () => {
    const services = OLD_SITE_REDIRECTS.filter(
      (redirect) => redirect.source.startsWith("/service-detail/") && !redirect.source.includes(":"),
    );
    expect(services.map((redirect) => redirect.destination).toSorted()).toEqual(
      SEED_SERVICES.map((service) => ROUTES.service(service.slug)).toSorted(),
    );
  });
});
