import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { ServicePage } from "@/features/services/components/ServicePage";
import { imageFixture, publishedFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";
import { mockObservers } from "@tests/support/motion";

// The page's line watches the page; here it only needs to be drawn.
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));
beforeEach(() => mockObservers());
afterEach(() => vi.unstubAllGlobals());

const en = <T,>(value: T) => ({ en: value });

describe("ServicePage", () => {
  it("opens a family service on a sky sign with its photo and WhatsApp and a call, then the others on its line", () => {
    const service = publishedFixture(serviceFixture({ forWhom: en("Anyone who needs care at home.") }));
    const elderly = publishedFixture(serviceFixture({ name: en("Elderly care"), slug: "elderly-care" }));
    const { container } = render(
      <ServicePage service={service} related={[elderly]} site={siteFixture()} image={imageFixture()} />,
    );
    expect(container.querySelector("#start section")).toHaveClass("bg-sky");
    const sign = within(container.querySelector<HTMLElement>("#start")!);
    expect(sign.getByRole("heading", { level: 1, name: "Home nursing care" })).toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    expect(sign.getByRole("img")).toHaveAttribute("fetchpriority", "high");

    const about = screen.getByRole("region", { name: UI_TEXT.aboutService });
    expect(within(about).getByText("Care at home.")).toBeInTheDocument();
    expect(within(about).getByRole("heading", { level: 3, name: UI_TEXT.whoItIsFor })).toBeInTheDocument();
    expect(within(about).getByText("Anyone who needs care at home.")).toBeInTheDocument();
    expect(within(about).getByRole("listitem")).toHaveTextContent("Medication management");

    const line = container.querySelector<HTMLElement>("#line")!;
    expect(within(line).getByRole("heading", { level: 2, name: UI_TEXT.lineCareAtHome })).toBeInTheDocument();
    expect(within(line).getByRole("link", { name: "Elderly care" })).toHaveAttribute(
      "href",
      ROUTES.service("elderly-care"),
    );
    expect(screen.getByRole("navigation", { name: UI_TEXT.onThisPage })).toBeInTheDocument();
    const data = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => JSON.parse(script.innerHTML)["@type"],
    );
    expect(data).toEqual(["Service", "BreadcrumbList"]);
  });

  it("opens a staffing service on a deep-blue sign with a quote for it, and keeps to what it has", () => {
    const service = publishedFixture(
      serviceFixture({ audience: "INSTITUTIONS", slug: "school-nurse-staffing", included: [], forWhom: en(null) }),
    );
    const { container } = render(<ServicePage service={service} related={[]} site={null} image={null} />);
    expect(container.querySelector("#start section")).toHaveClass("bg-deep");
    for (const quote of screen.getAllByRole("link", { name: UI_TEXT.requestQuote }))
      expect(quote).toHaveAttribute("href", ROUTES.quoteFor("school-nurse-staffing"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whoItIsFor)).not.toBeInTheDocument();
    expect(container.querySelector("#line ol")).toBeNull();
  });

  it("shows what a service includes, or who it is for, each without the other", () => {
    const { rerender } = render(
      <ServicePage
        service={publishedFixture(serviceFixture({ forWhom: en(null) }))}
        related={[]}
        site={null}
        image={null}
      />,
    );
    expect(screen.getByRole("heading", { name: UI_TEXT.whatItIncludes })).toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whoItIsFor)).not.toBeInTheDocument();

    rerender(
      <ServicePage
        service={publishedFixture(serviceFixture({ forWhom: en("Older people."), included: [] }))}
        related={[]}
        site={null}
        image={null}
      />,
    );
    expect(screen.getByRole("heading", { name: UI_TEXT.whoItIsFor })).toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whatItIncludes)).not.toBeInTheDocument();
  });
});
