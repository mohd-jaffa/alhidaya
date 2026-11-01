import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RiseWords } from "@/components/motion/RiseWords";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

describe("RiseWords (D129)", () => {
  it("shows its words as they are before motion loads, or with motion reduced", () => {
    motion.engine = null;
    const { container } = render(<RiseWords text="What we do" />);
    expect(container.querySelectorAll("[data-word]")).toHaveLength(3);
  });

  it("raises its words one after another from behind their line, once, as it scrolls into view", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { container, unmount } = render(<RiseWords text="Our clients" />);
    const holder = container.firstElementChild;
    expect(fake.gsap.from).toHaveBeenCalledWith(container.querySelectorAll("[data-word]"), {
      yPercent: 110,
      duration: MOTION.duration.reveal,
      stagger: MOTION.wordStagger,
      ease: MOTION.ease.out,
      scrollTrigger: { trigger: holder, start: "top 90%", once: true },
    });
    unmount();
    expect(fake.revert).toHaveBeenCalled();
  });

  it("never moves a heading already on screen", () => {
    const fake = fakeEngine({ inViewport: true });
    motion.engine = fake.engine;
    render(<RiseWords text="About us" />);
    expect(fake.gsap.from).not.toHaveBeenCalled();
  });
});
