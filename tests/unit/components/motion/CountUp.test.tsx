import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CountUp, countable } from "@/components/motion/CountUp";
import { MOTION } from "@/lib/motion/tokens";
import { fakeEngine } from "@tests/support/motion";

const motion = vi.hoisted(() => ({ engine: null as unknown }));
vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: motion.engine }) }));

describe("countable", () => {
  it("reads a whole number with words after it, and nothing else", () => {
    expect(countable("8")).toEqual({ number: 8, rest: "" });
    expect(countable("10k+")).toEqual({ number: 10, rest: "k+" });
    expect(countable("24/7")).toBeNull();
    expect(countable("Doha")).toBeNull();
  });
});

describe("CountUp (D97, D99)", () => {
  it("tells a screen reader the figure once, as written, and shows it as written before motion loads", () => {
    motion.engine = null;
    const { container } = render(<CountUp value="24/7" className="text-figure" />);
    expect(screen.getByText("24/7", { selector: ".sr-only" })).toBeInTheDocument();
    expect(container.querySelector("[aria-hidden]")).toHaveTextContent("24/7");
    expect(container.firstElementChild).toHaveClass("text-figure");
  });

  it("counts a whole number up once as it scrolls into view, writing each step, and puts it back on leaving", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    const { container, unmount } = render(<CountUp value="25k" />);
    const shown = container.querySelector<HTMLElement>("[aria-hidden]")!;
    const [target, options] = fake.gsap.to.mock.calls[0] as [
      { number: number },
      { number: number; duration: number; onUpdate: () => void; scrollTrigger: unknown },
    ];
    expect(options).toMatchObject({
      number: 25,
      duration: MOTION.duration.count,
      scrollTrigger: { trigger: shown, once: true },
    });
    target.number = 12;
    options.onUpdate();
    expect(shown).toHaveTextContent("12k");
    unmount();
    expect(fake.revert).toHaveBeenCalled();
    expect(shown).toHaveTextContent("25k");
  });

  it("leaves a figure that is not a number, or one already on screen, as written", () => {
    const fake = fakeEngine();
    motion.engine = fake.engine;
    render(<CountUp value="24/7" />);
    expect(fake.gsap.to).not.toHaveBeenCalled();
    const seen = fakeEngine({ inViewport: true });
    motion.engine = seen.engine;
    render(<CountUp value="8" />);
    expect(seen.gsap.to).not.toHaveBeenCalled();
  });
});
