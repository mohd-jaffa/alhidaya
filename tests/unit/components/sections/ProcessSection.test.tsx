import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProcessSection } from "@/components/sections/ProcessSection";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

type Process = Extract<Section, { type: "PROCESS" }>["content"];
const phone = { ...imageFixture("On the phone"), id: "phone" };
const image = (ref: { mediaId: string } | null) => (ref?.mediaId === "phone" ? phone : null);

describe("ProcessSection (D97)", () => {
  it("opens with its pill and heading, then its steps in order, numbered, each with a round photo and words", () => {
    const content: Process = {
      ...contentFixture("PROCESS"),
      steps: [
        { image: { mediaId: "phone" }, title: { en: "Tell us what you need" }, text: { en: "Call or message us." } },
        { image: null, title: { en: "Care begins" }, text: { en: null } },
      ],
    };
    const { container } = render(<ProcessSection anchor="how-it-works" content={content} image={image} />);
    expect(container.firstElementChild).toHaveAttribute("id", "how-it-works");
    expect(screen.getByText("How it works")).toBeVisible();
    const steps = screen.getByRole("list");
    expect(steps.tagName).toBe("OL");
    const [first, second] = within(steps).getAllByRole("listitem");
    expect(first).toHaveTextContent("01");
    expect(within(first).getByRole("heading", { level: 3, name: "Tell us what you need" })).toBeVisible();
    expect(within(first).getByText("Call or message us.")).toBeVisible();
    expect(first.querySelector('img[alt=""]')).not.toBeNull();
    expect(second).toHaveTextContent("02");
    expect(second.querySelector("img")).toBeNull();
  });
});
