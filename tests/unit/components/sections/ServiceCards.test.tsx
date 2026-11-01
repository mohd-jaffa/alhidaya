import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServiceCards } from "@/components/sections/ServiceCards";
import { ROUTES } from "@/constants/routes";
import { imageFixture, publishedFixture, serviceFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("ServiceCards", () => {
  it("gives each service Home's card: its photo, its audience and its name opening its page (D135)", () => {
    const photo = imageFixture("A nurse at home");
    const withPhoto = publishedFixture(serviceFixture({ image: { mediaId: photo.id } }));
    const without = publishedFixture(
      serviceFixture({ name: en("Elderly care"), slug: "elderly-care", summary: en("Care for older people.") }),
    );
    const { container } = render(
      <ServiceCards services={[withPhoto, without]} image={(ref) => (ref?.mediaId === photo.id ? photo : null)} />,
    );
    const [first, second] = screen.getAllByRole("listitem");
    expect(within(first).getByRole("link", { name: /Home nursing care/ })).toHaveAttribute(
      "href",
      ROUTES.service("home-nursing-care"),
    );
    expect(within(first).getByText("For families")).toBeInTheDocument();
    // The photo shows the service the card names, so it is decoration beside the name.
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(first.querySelector("img")).toHaveAttribute("alt", "");
    expect(within(second).getByRole("link", { name: /Elderly care/ })).toBeInTheDocument();
    expect(second.querySelector("img")).toBeNull();
  });
});
