import { render, screen } from "@testing-library/react";
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
  it("puts every service in published order in one green compact-card catalogue on Services (D150)", () => {
    const content = { ...contentFixture("SERVICES_INDEX"), intro: en("All our care services.") };
    const { rerender } = render(
      <ServicesIndexSection
        unified
        anchor="services"
        content={content}
        services={[homeCare, staffing, elderly]}
        site={siteFixture()}
        image={noImage}
      />,
    );
    expect(screen.getByRole("region", { name: "Services" })).toHaveClass("bg-leaf-pale");
    expect(screen.getByText("All our care services.")).toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      ROUTES.service("home-nursing-care"),
      ROUTES.service("school-nurse-staffing"),
      ROUTES.service("elderly-care"),
    ]);
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
    expect(screen.queryByText(AUDIENCE_LABELS.FAMILIES)).toBeNull();
    expect(screen.queryByText(AUDIENCE_LABELS.INSTITUTIONS)).toBeNull();
    expect(screen.queryByRole("link", { name: UI_TEXT.requestQuote })).toBeNull();
    rerender(
      <ServicesIndexSection
        unified
        anchor="services"
        content={contentFixture("SERVICES_INDEX")}
        services={[]}
        site={null}
        image={noImage}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("region", { name: "Services" }).querySelector(".text-lead")).toBeNull();
  });
  it("keeps one ordered collection on every other section placement, without audience labels or actions", () => {
    render(
      <ServicesIndexSection
        anchor="services"
        content={contentFixture("SERVICES_INDEX")}
        services={[homeCare, staffing, elderly]}
        site={siteFixture()}
        image={noImage}
      />,
    );
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      ROUTES.service("home-nursing-care"),
      ROUTES.service("school-nurse-staffing"),
      ROUTES.service("elderly-care"),
    ]);
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
    expect(screen.queryByText(AUDIENCE_LABELS.FAMILIES)).toBeNull();
    expect(screen.queryByText(AUDIENCE_LABELS.INSTITUTIONS)).toBeNull();
    expect(screen.queryByRole("link", { name: UI_TEXT.requestQuote })).toBeNull();
  });
  it("keeps the optional introduction on uncategorised section placements", () => {
    render(
      <ServicesIndexSection
        anchor="services"
        content={{ ...contentFixture("SERVICES_INDEX"), intro: en("Nursing care across Doha.") }}
        services={[]}
        site={null}
        image={noImage}
      />,
    );
    expect(screen.getByText("Nursing care across Doha.")).toBeInTheDocument();
  });
});
