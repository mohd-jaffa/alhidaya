import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServicesIndexSection } from "@/components/sections/ServicesIndexSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { contentFixture, publishedFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

const homeCare = publishedFixture(serviceFixture());
const elderly = publishedFixture(
  serviceFixture({ name: en("Elderly care"), slug: "elderly-care", summary: en("Care for older people.") }),
);
const staffing = publishedFixture(
  serviceFixture({ name: en("School nurse staffing"), slug: "school-nurse-staffing", audience: "INSTITUTIONS" }),
);

describe("ServicesIndexSection", () => {
  it("runs each audience's services as stops on its line, in order, each the link to its page", () => {
    const content = { ...contentFixture("SERVICES_INDEX"), intro: en("Care at home, and nurses for institutions.") };
    render(
      <ServicesIndexSection
        anchor="services"
        content={content}
        services={[homeCare, staffing, elderly]}
        site={siteFixture()}
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

    expect(screen.getByRole("heading", { level: 3, name: UI_TEXT.lineCareAtHome })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: UI_TEXT.lineStaffing })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
  });

  it("leaves out a line with no published services, and the calls when the numbers are not published", () => {
    render(
      <ServicesIndexSection
        anchor="services"
        content={contentFixture("SERVICES_INDEX")}
        services={[homeCare]}
        site={null}
      />,
    );
    expect(screen.getByRole("heading", { name: UI_TEXT.lineCareAtHome })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: UI_TEXT.lineStaffing })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.whatsapp })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Services" }).querySelector(".text-lead")).toBeNull();
  });
});
