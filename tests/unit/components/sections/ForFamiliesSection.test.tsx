import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ForFamiliesSection } from "@/components/sections/ForFamiliesSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture, publishedFixture, serviceFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

type Families = Extract<Section, { type: "FOR_FAMILIES" }>["content"];
const photos = [
  { ...imageFixture("A nurse at home"), id: "home" },
  { ...imageFixture("A carer with a couple"), id: "family" },
];
const image = (ref: { mediaId: string } | null) => (ref ? (photos.find(({ id }) => id === ref.mediaId) ?? null) : null);
const services = [
  publishedFixture(
    serviceFixture({ name: { en: "Home nursing care" }, slug: "home-nursing-care", image: { mediaId: "home" } }),
  ),
  publishedFixture(serviceFixture({ name: { en: "Elderly care" }, slug: "elderly-care", image: null })),
  publishedFixture(
    serviceFixture({ name: { en: "School nurse staffing" }, slug: "school-nurse-staffing", audience: "INSTITUTIONS" }),
  ),
];

describe("ForFamiliesSection (D97, D102, D105)", () => {
  it("opens with its pill and heading, slides the family services through its card, each opening its page", () => {
    const content: Families = {
      ...contentFixture("FOR_FAMILIES"),
      photo: { image: { mediaId: "family" }, text: { en: "A nurse comes to your home." } },
    };
    render(<ForFamiliesSection anchor="families" content={content} services={services} image={image} />);
    expect(screen.getByText("For families")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: /Care for the people you love/ })).toBeVisible();
    const strip = screen.getByRole("link", { name: "Home nursing care" }).closest("ul")!;
    expect(
      within(strip)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([ROUTES.service("home-nursing-care"), ROUTES.service("elderly-care")]);
    expect(screen.queryByRole("link", { name: "School nurse staffing" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);
    expect(screen.getByText("A nurse comes to your home.")).toBeVisible();
    expect(screen.queryByRole("img", { name: "A carer with a couple" })).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Day and night" })).toBeVisible();
  });

  it("stands without services, a photo, words or features", () => {
    const content: Families = {
      ...contentFixture("FOR_FAMILIES"),
      photo: { image: null, text: { en: null } },
      features: [{ pictogram: null, title: { en: "On WhatsApp" } }],
    };
    const { container, rerender } = render(
      <ForFamiliesSection anchor="families" content={content} services={[]} image={image} />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "On WhatsApp" })).toBeVisible();
    rerender(
      <ForFamiliesSection
        anchor="families"
        content={{ ...content, photo: { image: { mediaId: "family" }, text: { en: null } }, features: [] }}
        services={[]}
        image={image}
      />,
    );
    expect(screen.getByRole("img", { name: "A carer with a couple" })).toBeVisible();
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
  });
});
