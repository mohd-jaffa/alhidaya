import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { UI_TEXT } from "@/constants/messages";

describe("CarouselArrow", () => {
  it("uses a labelled touch-sized previous/next chevron with mirrored RTL direction and no visible glyph text", () => {
    const previous = vi.fn();
    const next = vi.fn();
    render(
      <>
        <CarouselArrow direction="previous" onClick={previous} />
        <CarouselArrow direction="next" onClick={next} />
      </>,
    );
    const before = screen.getByRole("button", { name: UI_TEXT.previousSlide });
    const after = screen.getByRole("button", { name: UI_TEXT.nextSlide });
    expect(before).toHaveAttribute("type", "button");
    expect(before).toHaveClass("size-touch");
    expect(before.querySelector("svg")).toHaveClass("rotate-90", "rtl:-rotate-90");
    expect(after.querySelector("svg")).toHaveClass("-rotate-90", "rtl:rotate-90");
    expect(before).toHaveTextContent("");
    fireEvent.click(before);
    fireEvent.click(after);
    expect(previous).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
  });
});
