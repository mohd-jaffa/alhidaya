import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "@/components/sections/HeroSection";
import { UI_TEXT } from "@/constants/messages";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture, slideFixture } from "@tests/support/fixtures/content";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

const photos: Record<string, SiteImage> = {
  one: { ...imageFixture("A nurse with an older woman"), id: "one" },
  two: { ...imageFixture("A nurse on a ward"), id: "two" },
};
const image = (ref: { mediaId: string } | null) => (ref ? (photos[ref.mediaId] ?? null) : null);

const hero = (overrides: Partial<SignContent> = {}): SignContent => ({
  ...contentFixture("SIGN"),
  slides: [
    slideFixture({ image: { mediaId: "one" } }),
    slideFixture({
      image: { mediaId: "gone" },
      headline: { en: "Nurses for hospitals and schools." },
      highlight: { en: null },
      text: { en: null },
      buttonLabel: { en: "Request a quote" },
      buttonHref: { en: "/quote" },
    }),
  ],
  note: { pictogram: "clock", text: { en: "Nurses around the clock" } },
  ...overrides,
});

describe("HeroSection (D128)", () => {
  it("opens Home at its anchor with each slide's headline, its phrase in blue, its words and its photo, the first fetched first", () => {
    const { container } = render(<HeroSection anchor="start" content={hero()} image={image} />);
    expect(container.firstElementChild).toHaveAttribute("id", "start");
    const first = screen.getByRole("group", { name: UI_TEXT.slideOf(1, 2) });
    expect(first).toHaveTextContent("Quality nursing care at your doorstep.");
    expect(first.querySelector(".text-deep")).toHaveTextContent("nursing");
    expect(first).toHaveTextContent("Nurses who care for your loved ones at home.");
    const [photo] = container.querySelectorAll("img");
    expect(photo).toHaveAttribute("alt", "A nurse with an older woman");
    expect(photo).toHaveAttribute("fetchpriority", "high");
  });

  it("gives a slide its button only with both words and a link, and a slide without a photo the mist", () => {
    const { container } = render(<HeroSection anchor="start" content={hero()} image={image} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("Request a quote").closest("a")).toHaveAttribute("href", "/quote");
    expect(container.querySelectorAll(".slide-photo .bg-mist")).toHaveLength(1);
  });

  it("puts the card on the photo with its icon, or no card when it has no words", () => {
    const { container, rerender } = render(<HeroSection anchor="start" content={hero()} image={image} />);
    expect(screen.getByText("Nurses around the clock")).toBeInTheDocument();
    rerender(
      <HeroSection anchor="start" content={hero({ note: { pictogram: null, text: { en: null } } })} image={image} />,
    );
    expect(screen.queryByText("Nurses around the clock")).not.toBeInTheDocument();
    rerender(
      <HeroSection
        anchor="start"
        content={hero({ note: { pictogram: null, text: { en: "Day and night" } } })}
        image={image}
      />,
    );
    expect(screen.getByText("Day and night").previousElementSibling).toBeNull();
    expect(container.querySelector(".slide-photo")).not.toBeNull();
  });
});
