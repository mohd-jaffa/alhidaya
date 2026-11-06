import { describe, expect, it } from "vitest";

import { isHere, needsCompactMenu, visibleLinks } from "@/components/site/navigation";
import { siteFixture } from "@tests/support/fixtures/content";

describe("the navigation", () => {
  it("keeps ordinary navigation in the pill and uses the full menu for long labels or extra links", () => {
    const links = visibleLinks(siteFixture());
    expect(needsCompactMenu(links)).toBe(false);
    expect(needsCompactMenu([])).toBe(false);
    expect(needsCompactMenu([{ ...links[0], label: { en: "Nursing care for hospitals, clinics and schools" } }])).toBe(
      true,
    );
    expect(
      needsCompactMenu(
        Array.from({ length: 6 }, (_, at) => ({ ...links[0], href: `/page-${at}`, label: { en: "A" } })),
      ),
    ).toBe(true);
  });
  it("shows the links the admin left showing, and none without published content", () => {
    const site = siteFixture({
      navigation: [
        { label: { en: "Services" }, href: "/services", visible: true },
        { label: { en: "Brochure" }, href: "/brochure", visible: false },
      ],
    });
    expect(visibleLinks(site).map((link) => link.href)).toEqual(["/services"]);
    expect(visibleLinks(null)).toEqual([]);
  });

  it("knows the page the visitor is on, and the pages inside it", () => {
    expect(isHere("/services", "/services")).toBe(true);
    expect(isHere("/services/elderly-care", "/services")).toBe(true);
    expect(isHere("/servicesx", "/services")).toBe(false);
    expect(isHere("/", "/about")).toBe(false);
  });
});
