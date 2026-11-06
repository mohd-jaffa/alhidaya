import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MissionPanels } from "@/components/sections/MissionPanels";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

const panels = () =>
  render(
    <MissionPanels>
      {["Mission", "Vision"].map((title) => (
        <article key={title} data-mission-panel>
          <svg>
            <g data-art-part data-from-x="24" data-from-y="-24" />
            <g data-art-part />
          </svg>
          <span data-mission-rule />
          <h2>
            <span data-word>{title}</span>
          </h2>
          <p data-mission-statement>{title} statement</p>
        </article>
      ))}
    </MissionPanels>,
  );

describe("MissionPanels", () => {
  it("shows both statements before motion loads or with reduced motion", () => {
    motion.engine = null;
    panels();
    expect(screen.getByText("Mission statement")).toBeVisible();
    expect(screen.getByText("Vision statement")).toBeVisible();
  });

  it("sequences each panel, masked heading and statement once, then cleans up on navigation", () => {
    const fake = fakeEngine();
    const from = vi.fn().mockReturnThis();
    const timeline = vi.fn(() => ({ from }));
    motion.engine = { ...fake.engine, gsap: { ...fake.gsap, timeline } };
    const { container, unmount } = panels();
    const [mission, vision] = container.querySelectorAll("article");
    expect(timeline).toHaveBeenNthCalledWith(1, {
      delay: 0,
      scrollTrigger: { trigger: mission, start: "top 85%", once: true },
    });
    expect(timeline).toHaveBeenNthCalledWith(2, {
      delay: MOTION.stagger,
      scrollTrigger: { trigger: vision, start: "top 85%", once: true },
    });
    expect(from).toHaveBeenCalledWith(mission, expect.objectContaining({ opacity: 0, y: MOTION.revealDistance }));
    expect(from).toHaveBeenCalledWith(
      mission.querySelectorAll("[data-word]"),
      expect.objectContaining({ yPercent: 110, stagger: MOTION.wordStagger }),
      MOTION.stagger * 3,
    );
    expect(from).toHaveBeenCalledWith(
      mission.querySelector("p"),
      expect.objectContaining({ opacity: 0, y: MOTION.revealDistance / 2 }),
      MOTION.stagger * 6,
    );
    expect(from).toHaveBeenCalledWith(
      mission.querySelector("[data-art-part]"),
      expect.objectContaining({ x: 24, y: -24, scale: 0.5 }),
      0,
    );
    unmount();
    expect(fake.revert).toHaveBeenCalled();
  });

  it("leaves panels already in view visible and still", () => {
    const fake = fakeEngine({ inViewport: true });
    const timeline = vi.fn();
    motion.engine = { ...fake.engine, gsap: { ...fake.gsap, timeline } };
    panels();
    expect(timeline).not.toHaveBeenCalled();
  });
});
