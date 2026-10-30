import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HighlightsSection } from "@/components/sections/HighlightsSection";
import type { SiteImage } from "@/features/media/types";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

type Highlights = Extract<Section, { type: "HIGHLIGHTS" }>["content"];
const photos: Record<string, SiteImage> = {
  care: { ...imageFixture("A carer laughing"), id: "care" },
  ward: { ...imageFixture("Two nurses talking"), id: "ward" },
  face: { ...imageFixture("A face"), id: "face" },
};
const image = (ref: { mediaId: string } | null) => (ref ? (photos[ref.mediaId] ?? null) : null);

describe("HighlightsSection (D97)", () => {
  it("shows four cards: a note, a photo with its words, the green card with faces and a figure, and a photo", () => {
    const content: Highlights = {
      ...contentFixture("HIGHLIGHTS"),
      first: { image: { mediaId: "care" }, label: { en: "Care at home" } },
      accent: {
        title: { en: "Two businesses" },
        text: { en: "Home care and staffing." },
        avatars: [{ mediaId: "face" }, { mediaId: "gone" }],
        fact: { value: { en: "8" }, label: { en: "Services" } },
      },
      second: { image: { mediaId: "ward" }, label: { en: null } },
    };
    const { container } = render(<HighlightsSection anchor="highlights" content={content} image={image} />);
    expect(container.firstElementChild).toHaveAttribute("id", "highlights");
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole("heading", { name: "Across Doha" })).toBeVisible();
    expect(screen.getByText("Care at home")).toBeVisible();
    // A photo with words on it is described by them; one without words says what it shows.
    expect(screen.queryByRole("img", { name: "A carer laughing" })).toBeNull();
    expect(screen.getByRole("img", { name: "Two nurses talking" })).toBeVisible();
    expect(screen.getByText("Home care and staffing.")).toBeVisible();
    expect(screen.getByText("Services")).toBeVisible();
  });

  it("stands without photos, icons, words or a figure", () => {
    const content: Highlights = {
      note: { pictogram: null, title: { en: "Across Doha" }, text: { en: null } },
      first: { image: null, label: { en: null } },
      accent: {
        title: { en: "Two businesses" },
        text: { en: null },
        avatars: [],
        fact: { value: { en: null }, label: { en: null } },
      },
      second: { image: null, label: { en: null } },
    };
    const { container } = render(<HighlightsSection anchor="highlights" content={content} image={image} />);
    expect(container.querySelector("img")).toBeNull();
    // Only the green card's globe, drawn as decoration.
    expect([...container.querySelectorAll("svg")].map((svg) => svg.getAttribute("aria-hidden"))).toEqual(["true"]);
    expect(screen.getByRole("heading", { name: "Two businesses" })).toBeVisible();
  });

  it("shows a figure without its words", () => {
    const content: Highlights = {
      ...contentFixture("HIGHLIGHTS"),
      accent: {
        title: { en: "Two" },
        text: { en: null },
        avatars: [],
        fact: { value: { en: "24/7" }, label: { en: null } },
      },
    };
    render(<HighlightsSection anchor="highlights" content={content} image={image} />);
    expect(screen.getAllByText("24/7")[0]).toBeInTheDocument();
  });
});
