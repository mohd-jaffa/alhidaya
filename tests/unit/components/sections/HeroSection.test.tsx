import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "@/components/sections/HeroSection";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture, siteFixture } from "@tests/support/fixtures/content";

type SignContent = Extract<Section, { type: "SIGN" }>["content"];

const photos: Record<string, SiteImage> = {
  hero: { ...imageFixture("A nurse at a desk"), id: "hero" },
  card: { ...imageFixture("A nurse at home"), id: "card" },
  a: { ...imageFixture("A face"), id: "a" },
  b: { ...imageFixture("Another face"), id: "b" },
};
const image = (ref: { mediaId: string } | null) => (ref ? (photos[ref.mediaId] ?? null) : null);

const hero = (overrides: Partial<SignContent> = {}): SignContent => ({
  ...contentFixture("SIGN"),
  headline: { en: "Quality nursing care at your doorstep" },
  highlight: { en: "nursing care" },
  lede: { en: "Nursing care at home across Doha." },
  image: { mediaId: "hero" },
  avatars: [{ mediaId: "a" }, { mediaId: "b" }, { mediaId: "gone" }],
  chips: [{ en: "At home" }, { en: "Day and night" }],
  card: { title: { en: "Home nursing care" }, tag: { en: "Our services" }, image: { mediaId: "card" } },
  note: { pictogram: "clock", text: { en: "Nurses around the clock" } },
  fact: { value: { en: "24/7" }, label: { en: "Nurses around the clock" } },
  ...overrides,
});

describe("HeroSection (D97)", () => {
  it("opens Home with its headline, words, WhatsApp and the quote, faces, a real fact, and its photo first", () => {
    const { container } = render(<HeroSection anchor="start" content={hero()} image={image} site={siteFixture()} />);
    expect(container.firstElementChild).toHaveAttribute("id", "start");
    expect(screen.getByRole("heading", { level: 1, name: "Quality nursing care at your doorstep" })).toBeVisible();
    expect(container.querySelector(".bg-leaf-pale")).toHaveTextContent("nursing care");
    expect(screen.getByText("Nursing care at home across Doha.")).toBeVisible();
    expect(screen.getByRole("link", { name: UI_TEXT.whatsapp })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/wa\.me\/97431306555\?text=/),
    );
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", ROUTES.quote);
    expect(screen.getByRole("img", { name: "A nurse at a desk" })).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByText("24/7")).toBeVisible();
    // A face whose photograph is gone is left out.
    expect(container.querySelectorAll('img[alt=""]').length).toBeGreaterThanOrEqual(4);
  });

  it("puts its chips over the photo, and its two cards at the photo's foot", () => {
    render(<HeroSection anchor="start" content={hero()} image={image} site={siteFixture()} />);
    const chips = screen.getByText("At home").closest("ul")!;
    expect(within(chips).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Home nursing care")).toBeVisible();
    expect(screen.getByText("Our services")).toBeVisible();
    expect(screen.getByText("Nurses around the clock", { selector: "span.font-medium" })).toBeVisible();
  });

  it("stands with only its headline, before the site content is published", () => {
    const { container } = render(
      <HeroSection
        anchor="start"
        content={{ ...contentFixture("SIGN"), lede: { en: null }, highlight: { en: null } }}
        image={image}
        site={null}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
    expect(screen.queryByRole("link", { name: UI_TEXT.whatsapp })).toBeNull();
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toBeVisible();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("shows a card or a note on its own, a fact without its words, and a card without its tag or photo", () => {
    const { rerender } = render(
      <HeroSection
        anchor="start"
        content={hero({
          card: { title: { en: null }, tag: { en: null }, image: null },
          note: { pictogram: null, text: { en: "Around the clock" } },
          fact: { value: { en: "8" }, label: { en: null } },
        })}
        image={image}
        site={null}
      />,
    );
    expect(screen.getByText("Around the clock")).toBeVisible();
    expect(screen.getByText("8")).toBeVisible();
    rerender(
      <HeroSection
        anchor="start"
        content={hero({
          card: { title: { en: "Elderly care" }, tag: { en: null }, image: null },
          note: { pictogram: null, text: { en: null } },
        })}
        image={image}
        site={null}
      />,
    );
    expect(screen.getByText("Elderly care")).toBeVisible();
    expect(screen.queryByText("Around the clock")).toBeNull();
  });
});
