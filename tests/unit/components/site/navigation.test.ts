import { describe, expect, it } from "vitest";

import { isHere, visibleLinks } from "@/components/site/navigation";
import { siteFixture } from "@tests/support/fixtures/content";

describe("the navigation", () => {
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
