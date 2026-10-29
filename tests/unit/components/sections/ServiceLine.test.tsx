import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LineActions, SERVICE_LINES, ServiceStops } from "@/components/sections/ServiceLine";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { publishedFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";

describe("SERVICE_LINES", () => {
  it("runs families' services on the sky line and institutions' on the deep-blue one, named as on Home", () => {
    expect(SERVICE_LINES.FAMILIES).toMatchObject({ tone: "sky", title: UI_TEXT.lineCareAtHome });
    expect(SERVICE_LINES.INSTITUTIONS).toMatchObject({ tone: "deep", title: UI_TEXT.lineStaffing });
  });
});

describe("LineActions", () => {
  it("gives families WhatsApp and a call, in the look of where they sit", () => {
    const { rerender } = render(<LineActions audience="FAMILIES" site={siteFixture()} look="skySign" />);
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveClass("bg-deep");
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveClass("border-navy");

    rerender(<LineActions audience="FAMILIES" site={siteFixture()} look="deepSign" />);
    expect(screen.getByRole("link", { name: UI_TEXT.call })).toHaveClass("border-on-deep");

    rerender(<LineActions audience="FAMILIES" site={null} look="row" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("gives institutions a quote, with the service already chosen when there is one", () => {
    const { rerender } = render(
      <LineActions audience="INSTITUTIONS" site={null} service="school-nurse-staffing" look="deepSign" />,
    );
    const quote = screen.getByRole("link", { name: UI_TEXT.requestQuote });
    expect(quote).toHaveAttribute("href", ROUTES.quoteFor("school-nurse-staffing"));
    expect(quote).toHaveClass("bg-ground");

    rerender(<LineActions audience="INSTITUTIONS" site={null} look="row" />);
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveClass("bg-deep");
  });
});

describe("ServiceStops", () => {
  it("lists the services as stops on the line, each its own link", () => {
    const { container } = render(<ServiceStops tone="sky" services={[publishedFixture(serviceFixture())]} />);
    expect(screen.getByRole("link", { name: "Home nursing care" })).toHaveAttribute(
      "href",
      ROUTES.service("home-nursing-care"),
    );
    expect(screen.getByText("Qualified nurses at home.")).toBeInTheDocument();
    expect(container.querySelector("ol > span")).toHaveClass("bg-sky");
  });
});
