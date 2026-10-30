import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatementWords } from "@/components/motion/StatementWords";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

const PARTS = [
  { text: "We bring", strong: false, pictogram: null },
  { text: "nursing care", strong: true, pictogram: "heart" as const },
  { text: "home.", strong: false, pictogram: null },
];

describe("StatementWords (D97)", () => {
  it("says the statement whole, its darker phrases navy and the rest the quiet grey, with an icon after a phrase", () => {
    motion.engine = null;
    const { container } = render(<StatementWords parts={PARTS} className="text-statement" />);
    const statement = container.querySelector("p")!;
    expect(statement).toHaveClass("text-statement");
    // A darker word is its grey self, read, with its navy self over it, not read.
    expect(screen.getByText("bring")).toHaveClass("text-ink-soft");
    const [grey, ink] = screen.getAllByText("nursing");
    expect(grey).toHaveClass("text-ink-soft");
    expect(ink).toHaveClass("text-navy");
    expect(ink).toHaveAttribute("aria-hidden", "true");
    expect(statement.querySelectorAll("[data-ink]")).toHaveLength(2);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("darkens its darker phrases word by word with the scroll, once motion loads, and undoes it on leaving", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { container, unmount } = render(<StatementWords parts={PARTS} />);
    expect(fake.gsap.fromTo).toHaveBeenCalledWith(
      container.querySelectorAll("[data-ink]"),
      { opacity: 0 },
      expect.objectContaining({
        opacity: 1,
        ease: "none",
        scrollTrigger: expect.objectContaining({ trigger: container.querySelector("p"), scrub: true }),
      }),
    );
    unmount();
    expect(fake.revert).toHaveBeenCalled();
  });

  it("leaves a statement already on screen as it is", () => {
    const fake = fakeEngine({ inViewport: true });
    motion.engine = fake.engine;
    render(<StatementWords parts={PARTS} />);
    expect(fake.gsap.fromTo).not.toHaveBeenCalled();
  });
});
