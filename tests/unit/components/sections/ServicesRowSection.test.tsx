import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ServicesRowSection } from "@/components/sections/ServicesRowSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import { contentFixture, imageFixture, publishedFixture, serviceFixture } from "@tests/support/fixtures/content";

vi.mock("@/lib/motion/services-pyramid", () => ({ mountServicesPyramid: () => () => undefined }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

const home = { ...imageFixture("A nurse at home"), id: "home" };
const image = (ref: { mediaId: string } | null) => (ref?.mediaId === "home" ? home : null);
const services = [
  publishedFixture(
    serviceFixture({ name: { en: "Home nursing care" }, slug: "home-nursing-care", image: { mediaId: "home" } }),
  ),
  publishedFixture(
    serviceFixture({ name: { en: "School nurse staffing" }, slug: "school-nurse-staffing", audience: "INSTITUTIONS" }),
  ),
];

describe("ServicesRowSection (D131)", () => {
  it("names itself by its heading and words on the mist band, every service a card opening its page", () => {
    render(
      <ServicesRowSection
        pyramid
        anchor="our-services"
        content={{ heading: { en: "What we do" }, text: { en: "Care at home, and nurses for institutions." } }}
        services={services}
        image={image}
      />,
    );
    const section = screen.getByRole("region", { name: "What we do" });
    expect(section).toHaveClass("bg-mist");
    expect(within(section).getByText("Care at home, and nurses for institutions.")).toBeInTheDocument();
    const cards = within(section).getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole("link")).toHaveAttribute("href", ROUTES.service("home-nursing-care"));
    expect(within(cards[0]).queryByText(AUDIENCE_LABELS.FAMILIES)).toBeNull();
    expect(within(cards[1]).queryByText(AUDIENCE_LABELS.INSTITUTIONS)).toBeNull();
    expect(cards[0].querySelector("img")).toHaveAttribute("alt", "");
    expect(cards[1].querySelector("img")).toBeNull();
    for (const card of cards) {
      const link = within(card).getByRole("link");
      expect(link).toHaveClass("pyramid-service", "aspect-[8/5]");
      expect(link.querySelector(".pyramid-service-name")).toHaveTextContent(/nurs/);
      expect(link.querySelector("svg")).toBeNull();
    }
  });

  it("ends with the way to all services, centred as a plain link, its words optional", () => {
    render(
      <ServicesRowSection anchor="our-services" content={contentFixture("SERVICES_ROW")} services={[]} image={image} />,
    );
    const all = screen.getByRole("link", { name: UI_TEXT.allServices });
    expect(all).toHaveAttribute("href", ROUTES.services);
    expect(all.parentElement).toHaveClass("text-center");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
