import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImageFrame, LogoTile, Skeleton } from "@/components/ui/frames";

describe("the frames", () => {
  it("hold a photograph in its shape, with a stock credit under it", () => {
    render(
      <ImageFrame ratio="portrait" credit="Photo: licensed stock">
        <span role="img" aria-label="A nurse with a patient at home" />
      </ImageFrame>,
    );
    const figure = screen.getByRole("figure");
    expect(figure.firstChild).toHaveClass("aspect-[4/5]");
    expect(figure.querySelector("figcaption")).toHaveTextContent("Photo: licensed stock");
    expect(screen.getByRole("img", { name: "A nurse with a patient at home" })).toBeInTheDocument();
  });

  it("frame a photograph without a credit at its usual shape", () => {
    render(
      <ImageFrame>
        <span role="img" aria-label="Doha" />
      </ImageFrame>,
    );
    expect(screen.getByRole("figure").firstChild).toHaveClass("aspect-[3/2]");
  });

  it("set a client's logo in a fixed 4:3 tile, never cropped", () => {
    const { container } = render(
      <LogoTile>
        <span role="img" aria-label="A clinic" />
      </LogoTile>,
    );
    expect(container.firstChild).toHaveClass("aspect-[4/3]", "[&_img]:object-contain", "[&_img]:mix-blend-multiply");
  });

  it("hold the place of what is loading, out of the screen reader's way", () => {
    const { container } = render(<Skeleton className="h-6" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass("animate-wait", "h-6");
    const { container: plain } = render(<Skeleton />);
    expect(plain.firstChild).toHaveClass("bg-mist");
  });
});
