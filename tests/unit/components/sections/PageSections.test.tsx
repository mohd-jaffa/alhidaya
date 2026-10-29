import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageSections } from "@/components/sections/PageSections";
import { SECTION_TYPES } from "@/constants/sections";
import { UI_TEXT } from "@/constants/messages";
import type { SectionData } from "@/features/content/types";
import type { Section } from "@/lib/validation";
import {
  clientFixture,
  imageFixture,
  jobFixture,
  publishedFixture,
  section,
  serviceFixture,
  siteFixture,
} from "@tests/support/fixtures/content";

const withImage = (type: "SIGN" | "INTRO" | "INSTITUTIONS", mediaId: string | null) => {
  const found = section(type);
  return { ...found, content: { ...found.content, image: mediaId ? { mediaId } : null } } as Section;
};

describe("PageSections", () => {
  it("draws every section type in the admin's order, each at its anchor, its images and forms in place", () => {
    const photo = imageFixture("A nurse at home");
    const client = publishedFixture(clientFixture({ name: { en: "Doha Clinic" } }));
    const data: SectionData = {
      site: siteFixture(),
      services: [publishedFixture(serviceFixture())],
      jobs: [{ ...publishedFixture(jobFixture()), open: true }],
      clients: [client],
      images: new Map([
        [photo.id, photo],
        [client.published.logo.mediaId, imageFixture()],
      ]),
    };
    const sections = SECTION_TYPES.map((type) =>
      type === "SIGN"
        ? withImage("SIGN", photo.id)
        : type === "INTRO"
          ? withImage("INTRO", crypto.randomUUID())
          : section(type),
    );
    const { container } = render(
      <PageSections
        page="ABOUT"
        sections={sections}
        data={data}
        forms={{ CONTACT: <form aria-label="Contact form" /> }}
      />,
    );

    expect([...container.querySelectorAll("[id]:not([id$='-heading'])")].map((element) => element.id)).toEqual([
      "start",
      "about",
      "services",
      "values",
      "mission",
      "institutions",
      "clients",
      "careers",
      "jobs",
      "contact",
      "reach-us",
      "form",
      "text",
    ]);
    expect(screen.getByRole("img", { name: "A nurse at home" })).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByRole("img", { name: "Doha Clinic" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.youAreHere)).not.toBeInTheDocument();
  });

  it("starts Home's three lines under its sign, and draws no form the page did not give", () => {
    const data: SectionData = { site: null, services: [], jobs: [], clients: [], images: new Map() };
    render(
      <PageSections
        page="HOME"
        sections={[withImage("SIGN", null), withImage("INSTITUTIONS", null), section("FORM")]}
        data={data}
      />,
    );
    expect(screen.getByText(UI_TEXT.youAreHere)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
