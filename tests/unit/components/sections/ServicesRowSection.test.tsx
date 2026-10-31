import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ServicesRowSection } from "@/components/sections/ServicesRowSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, imageFixture, publishedFixture, serviceFixture } from "@tests/support/fixtures/content";

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

describe("ServicesRowSection (D124)", () => {
  it("opens with its pill and heading, and runs every service past, each opening its page", () => {
    const { container } = render(
      <ServicesRowSection
        anchor="our-services"
        content={contentFixture("SERVICES_ROW")}
        services={services}
        image={image}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("id", "our-services");
    expect(screen.getByText("Our services")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: /Nursing care/ })).toBeVisible();
    const row = screen.getAllByRole("list")[0];
    expect(
      within(row)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([ROUTES.service("home-nursing-care"), ROUTES.service("school-nurse-staffing")]);
    expect(row.querySelector('img[alt=""]')).not.toBeNull();
    expect(screen.getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);
    expect(screen.getByRole("checkbox", { name: UI_TEXT.pauseServices })).toBeInTheDocument();
  });

  it("keeps the way to every service when none is published yet", () => {
    render(
      <ServicesRowSection anchor="our-services" content={contentFixture("SERVICES_ROW")} services={[]} image={image} />,
    );
    expect(screen.getByRole("link", { name: UI_TEXT.allServices })).toBeVisible();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});
