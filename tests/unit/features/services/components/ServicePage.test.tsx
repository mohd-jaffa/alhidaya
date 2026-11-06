import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
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
  it("opens on the title over its fading photo with hidden header actions, then retains the other service cards", () => {
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
    expect(sign.getByRole("heading", { level: 1, name: "Home nursing care" })).toBeInTheDocument();
    expect(sign.queryByRole("link")).not.toBeInTheDocument();
    expect(sign.getByRole("img", { name: "A nurse at home" })).toHaveAttribute("fetchpriority", "high");

    const about = screen.getByRole("region", { name: UI_TEXT.aboutService });
    expect(within(about).getByText("Care at home.")).toBeInTheDocument();
    expect(within(about).queryByRole("heading", { name: "Who it is for" })).not.toBeInTheDocument();
    expect(within(about).queryByText("Anyone who needs care at home.")).not.toBeInTheDocument();
    expect(within(about).getByRole("listitem")).toHaveTextContent("Medication management");

    const others = screen.getByRole("region", { name: UI_TEXT.otherServices });
    expect(within(others).getByRole("link", { name: /Elderly care/ })).toHaveAttribute(
      "href",
      ROUTES.service("elderly-care"),
    );
    expect(others.querySelector("img")).toHaveAttribute("alt", "");
    expect(within(others).getByRole("link", { name: UI_TEXT.allServices })).toHaveAttribute("href", ROUTES.services);
    expect(others).toHaveClass("bg-leaf-pale");
    expect(within(others).queryByText("For families")).not.toBeInTheDocument();
    const data = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => JSON.parse(script.innerHTML)["@type"],
    );
    expect(data).toEqual(["Service", "BreadcrumbList"]);
  });

  it("keeps a staffing service readable without an available photograph or optional actions", () => {
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
    // Its photo has left the library: the page opens on its words alone.
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Who it is for")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: UI_TEXT.otherServices })).not.toBeInTheDocument();
  });

  it("retains confirmed inclusions but omits the retired who-it-is-for section", () => {
    const { rerender } = render(
      <ServicePage
        service={publishedFixture(serviceFixture({ forWhom: en(null) }))}
        related={[]}
        site={null}
        images={NO_IMAGES}
      />,
    );
    expect(screen.getByRole("heading", { name: UI_TEXT.whatItIncludes })).toBeInTheDocument();
    expect(screen.queryByText("Who it is for")).not.toBeInTheDocument();

    rerender(
      <ServicePage
        service={publishedFixture(serviceFixture({ forWhom: en("Older people."), included: [] }))}
        related={[]}
        site={null}
        images={NO_IMAGES}
      />,
    );
    expect(screen.queryByRole("heading", { name: "Who it is for" })).not.toBeInTheDocument();
    expect(screen.queryByText(UI_TEXT.whatItIncludes)).not.toBeInTheDocument();
  });
});
