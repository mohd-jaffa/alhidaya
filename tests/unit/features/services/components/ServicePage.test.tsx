import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { AUDIENCE_LABELS } from "@/constants/statuses";
import { ServicePage } from "@/features/services/components/ServicePage";
import { imageFixture, publishedFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";
import { mockObservers } from "@tests/support/motion";

// The page's cards rise in as they scroll by; here they only need to be drawn.
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));
beforeEach(() => mockObservers());
afterEach(() => vi.unstubAllGlobals());

const en = <T,>(value: T) => ({ en: value });
const NO_IMAGES = new Map();

describe("ServicePage", () => {
  it("opens a family service under its pill with its photo, WhatsApp and a call, then the others as cards", () => {
    const photo = imageFixture("A nurse at home");
    const theirs = imageFixture("An older man and his nurse");
    const service = publishedFixture(
      serviceFixture({ forWhom: en("Anyone who needs care at home."), image: { mediaId: photo.id } }),
    );
    const elderly = publishedFixture(
      serviceFixture({ name: en("Elderly care"), slug: "elderly-care", image: { mediaId: theirs.id } }),
    );
    const { container } = render(
      <ServicePage
        service={service}
        related={[elderly]}
        site={siteFixture()}
        images={
          new Map([
            [photo.id, photo],
            [theirs.id, theirs],
          ])
        }
      />,
    );
    const sign = within(container.querySelector<HTMLElement>("#start")!);
    expect(sign.getByText(AUDIENCE_LABELS.FAMILIES)).toBeInTheDocument();
    expect(sign.getByRole("heading", { level: 1, name: "Home nursing care" })).toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    expect(sign.getByRole("link", { name: UI_TEXT.call })).toHaveAttribute("href", "tel:+97431306555");
    expect(sign.getByRole("img", { name: "A nurse at home" })).toHaveAttribute("fetchpriority", "high");

    const about = screen.getByRole("region", { name: UI_TEXT.aboutService });
    expect(within(about).getByText("Care at home.")).toBeInTheDocument();
    expect(within(about).getByRole("heading", { level: 3, name: UI_TEXT.whoItIsFor })).toBeInTheDocument();
    expect(within(about).getByText("Anyone who needs care at home.")).toBeInTheDocument();
    expect(within(about).getByRole("listitem")).toHaveTextContent("Medication management");

    const others = screen.getByRole("region", { name: UI_TEXT.otherServices });
    expect(within(others).getByRole("link", { name: "Elderly care" })).toHaveAttribute(
      "href",
      ROUTES.service("elderly-care"),
    );
    expect(others.querySelector("img")).toHaveAttribute("alt", "");
    expect(within(others).getByRole("link", { name: UI_TEXT.whatsapp })).toBeInTheDocument();
    const data = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => JSON.parse(script.innerHTML)["@type"],
    );
    expect(data).toEqual(["Service", "BreadcrumbList"]);
  });

  it("opens a staffing service with a quote for it, and keeps to what it has", () => {
    const service = publishedFixture(
      serviceFixture({
        audience: "INSTITUTIONS",
        slug: "school-nurse-staffing",
        included: [],
        forWhom: en(null),
        image: { mediaId: crypto.randomUUID() },
      }),
    );
    render(<ServicePage service={service} related={[]} site={null} images={NO_IMAGES} />);
    expect(screen.getByText(AUDIENCE_LABELS.INSTITUTIONS)).toBeInTheDocument();
    // Its photo has left the library: the page opens on its words alone.
    for (const quote of screen.getAllByRole("link", { name: UI_TEXT.requestQuote }))
      expect(quote).toHaveAttribute("href", ROUTES.quoteFor("school-nurse-staffing"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whoItIsFor)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: UI_TEXT.otherServices })).not.toBeInTheDocument();
  });

  it("shows what a service includes, or who it is for, each without the other", () => {
    const { rerender } = render(
      <ServicePage
        service={publishedFixture(serviceFixture({ forWhom: en(null) }))}
        related={[]}
        site={null}
        images={NO_IMAGES}
      />,
    );
    expect(screen.getByRole("heading", { name: UI_TEXT.whatItIncludes })).toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whoItIsFor)).not.toBeInTheDocument();

    rerender(
      <ServicePage
        service={publishedFixture(serviceFixture({ forWhom: en("Older people."), included: [] }))}
        related={[]}
        site={null}
        images={NO_IMAGES}
      />,
    );
    expect(screen.getByRole("heading", { name: UI_TEXT.whoItIsFor })).toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whatItIncludes)).not.toBeInTheDocument();
  });
});
