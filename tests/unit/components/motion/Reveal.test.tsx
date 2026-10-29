import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Reveal } from "@/components/motion/Reveal";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

describe("Reveal", () => {
  it("shows its content as it is, before motion loads or with motion reduced", () => {
    motion.engine = null;
    render(<Reveal className="grid">Care at home</Reveal>);
    expect(screen.getByText("Care at home")).toHaveClass("grid");
  });

  it("rises into place, by opacity and transform only, the first time it scrolls into view", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { unmount } = render(<Reveal>Elderly care</Reveal>);
    const element = screen.getByText("Elderly care");
    expect(fake.gsap.from).toHaveBeenCalledWith(element, {
      opacity: 0,
      y: MOTION.revealDistance,
      duration: MOTION.duration.reveal,
      ease: MOTION.ease.out,
      scrollTrigger: { trigger: element, start: "top 90%", once: true },
    });
    unmount();
    expect(fake.revert).toHaveBeenCalled();
  });

  it("never hides what is already on screen", () => {
    const fake = fakeEngine({ inViewport: true });
    motion.engine = fake.engine;
    render(<Reveal>Palliative care</Reveal>);
    expect(fake.gsap.from).not.toHaveBeenCalled();
  });
});
