import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServicesIndexSection } from "@/components/sections/ServicesIndexSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import { contentFixture, publishedFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

const homeCare = publishedFixture(serviceFixture());
const elderly = publishedFixture(
  serviceFixture({ name: en("Elderly care"), slug: "elderly-care", summary: en("Care for older people.") }),
);
const staffing = publishedFixture(
  serviceFixture({ name: en("School nurse staffing"), slug: "school-nurse-staffing", audience: "INSTITUTIONS" }),
);
const noImage = () => null;

describe("ServicesIndexSection", () => {
  it("sets each audience's services out as cards under its pill, in order, with that audience's actions", () => {
    const content = { ...contentFixture("SERVICES_INDEX"), intro: en("Care at home, and nurses for institutions.") };
    render(
      <ServicesIndexSection
        anchor="services"
        content={content}
        services={[homeCare, staffing, elderly]}
        site={siteFixture()}
        image={noImage}
      />,
    );
    expect(screen.getByRole("region", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByText("Care at home, and nurses for institutions.")).toBeInTheDocument();

    const [families, institutions] = screen.getAllByRole("list");
    expect(
      within(families)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([ROUTES.service("home-nursing-care"), ROUTES.service("elderly-care")]);
    expect(within(families).getByText("Care for older people.")).toBeInTheDocument();
    expect(within(institutions).getByRole("link", { name: "School nurse staffing" })).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 3, name: AUDIENCE_LABELS.FAMILIES })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: AUDIENCE_LABELS.INSTITUTIONS })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
  });

  it("leaves out an audience with no published services, and the calls when the numbers are not published", () => {
    render(
      <ServicesIndexSection
        anchor="services"
        content={contentFixture("SERVICES_INDEX")}
        services={[homeCare]}
        site={null}
        image={noImage}
      />,
    );
    expect(screen.getByRole("heading", { name: AUDIENCE_LABELS.FAMILIES })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: AUDIENCE_LABELS.INSTITUTIONS })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.whatsapp })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Services" }).querySelector(".text-lead")).toBeNull();
  });
});
