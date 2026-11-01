import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageSections } from "@/components/sections/PageSections";
import { SECTION_TYPES } from "@/constants/sections";
import { PAGE_NAMES, UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SectionData } from "@/features/content/types";
import type { Section } from "@/lib/validation";
import {
  clientFixture,
  imageFixture,
  pageFixture,
  jobFixture,
  publishedFixture,
  section,
  serviceFixture,
  siteFixture,
} from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

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
      "our-services",
    ]);
    expect(screen.getByRole("img", { name: "A nurse at home" })).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByRole("button", { name: "Doha Clinic" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
    expect(container.querySelector("#start")).toHaveTextContent(PAGE_NAMES.ABOUT);
  });

  it("opens Home on its slides edge to edge, its About leading to the About page, and draws no form the page did not give", () => {
    const data: SectionData = { site: siteFixture(), services: [], jobs: [], clients: [], images: new Map() };
    const home = pageFixture("HOME");
    const { container } = render(
      <PageSections page="HOME" sections={[home.sections[0], section("INTRO"), section("FORM")]} data={data} />,
    );
    expect(screen.queryByText(PAGE_NAMES.HOME)).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: UI_TEXT.slidesLabel })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.readAboutUs })).toHaveAttribute("href", ROUTES.about);
    expect(screen.getByRole("link", { name: siteFixture().contact.email })).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass("pt-16");
  });

  it("gives a form no email before the site content is published", () => {
    const data: SectionData = { site: null, services: [], jobs: [], clients: [], images: new Map() };
    render(<PageSections page="CONTACT" sections={[withImage("SIGN", null), section("FORM")]} data={data} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
