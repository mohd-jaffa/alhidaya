import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ForFamiliesSection } from "@/components/sections/ForFamiliesSection";
import { UI_TEXT } from "@/constants/messages";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

type Families = Extract<Section, { type: "FOR_FAMILIES" }>["content"];
const photos = [
  { ...imageFixture("On the phone"), id: "phone" },
  { ...imageFixture("A carer with a couple"), id: "family" },
];
const image = (ref: { mediaId: string } | null) => (ref ? (photos.find(({ id }) => id === ref.mediaId) ?? null) : null);

describe("ForFamiliesSection (D97, D105, D124)", () => {
  it("opens with its pill and heading, and runs how it works through its card, its steps in order", () => {
    const content: Families = {
      ...contentFixture("FOR_FAMILIES"),
      steps: [
        { image: { mediaId: "phone" }, title: { en: "Tell us what you need" }, text: { en: "Call or message us." } },
        { image: null, title: { en: "Care begins" }, text: { en: null } },
      ],
      photo: { image: { mediaId: "family" }, text: { en: "A nurse comes to your home." } },
    };
    render(<ForFamiliesSection anchor="families" content={content} image={image} />);
    expect(screen.getByText("For families")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: /Care for the people you love/ })).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "How it works" })).toBeVisible();
    const steps = screen.getAllByRole("list").find((list) => list.tagName === "OL")!;
    const [first, second] = within(steps).getAllByRole("listitem");
    expect(first).toHaveTextContent("01");
    expect(within(first).getByRole("heading", { level: 4, name: "Tell us what you need" })).toBeVisible();
    expect(within(first).getByText("Call or message us.")).toBeVisible();
    expect(first.querySelector('img[alt=""]')).not.toBeNull();
    expect(second).toHaveTextContent("02");
    expect(second.querySelector("img")).toBeNull();
    // They run in a loop, which its button pauses (D124).
    expect(screen.getByRole("checkbox", { name: UI_TEXT.pauseSteps })).toBeInTheDocument();
    expect(screen.getByText("A nurse comes to your home.")).toBeVisible();
    expect(screen.queryByRole("img", { name: "A carer with a couple" })).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Day and night" })).toBeVisible();
  });

  it("stands without steps, their label, a photo, words or features", () => {
    const content: Families = {
      ...contentFixture("FOR_FAMILIES"),
      stepsLabel: { en: null },
      steps: [],
      photo: { image: null, text: { en: null } },
      features: [{ pictogram: null, title: { en: "On WhatsApp" } }],
    };
    const { container, rerender } = render(<ForFamiliesSection anchor="families" content={content} image={image} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("heading", { name: "How it works" })).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "On WhatsApp" })).toBeVisible();
    rerender(
      <ForFamiliesSection
        anchor="families"
        content={{ ...content, photo: { image: { mediaId: "family" }, text: { en: null } }, features: [] }}
        image={image}
      />,
    );
    expect(screen.getByRole("img", { name: "A carer with a couple" })).toBeVisible();
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
  });
});
