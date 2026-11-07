import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaImage } from "@/components/ui/media-image";
import type { SiteImage } from "@/features/media/types";

const image = (sources: SiteImage["sources"], alt = "A nurse at a patient's bedside"): SiteImage => ({
  id: "6a1f0c1e-8d0a-4f43-9a35-1d1b8d4f8a10",
  width: 1600,
  height: 1067,
  alt,
  sources,
});

const made = (mime: string, extension: string, ...widths: number[]) =>
  widths.map((width) => ({ url: `/media/2026-10/abcdefghij-w${width}.${extension}`, width, mime }));

describe("MediaImage", () => {
  it("applies only an explicit placement point without changing sources or intrinsic size", () => {
    render(
      <MediaImage image={{ ...image(made("image/webp", "webp", 640)), focalPoint: { x: 0, y: 100 } }} sizes="100vw" />,
    );
    expect(screen.getByRole("img")).toHaveStyle({ objectPosition: "0% 100%" });
    expect(screen.getByRole("img")).toHaveAttribute("width", "1600");
  });
  it("offers AVIF, then WebP, at every made width, the image itself in the last type, shaped before it arrives", () => {
    const { container } = render(
      <MediaImage
        image={image([...made("image/webp", "webp", 1280, 640), ...made("image/avif", "avif", 640, 1280)])}
        sizes="(min-width: 64rem) 40vw, 100vw"
      />,
    );
    const [avif] = container.querySelectorAll("source");
    expect(container.querySelectorAll("source")).toHaveLength(1);
    expect(avif).toHaveAttribute("type", "image/avif");
    expect(avif).toHaveAttribute(
      "srcset",
      "/media/2026-10/abcdefghij-w640.avif 640w, /media/2026-10/abcdefghij-w1280.avif 1280w",
    );
    expect(avif).toHaveAttribute("sizes", "(min-width: 64rem) 40vw, 100vw");

    const img = screen.getByRole("img", { name: "A nurse at a patient's bedside" });
    expect(img).toHaveAttribute("src", "/media/2026-10/abcdefghij-w1280.webp");
    expect(img).toHaveAttribute(
      "srcset",
      "/media/2026-10/abcdefghij-w640.webp 640w, /media/2026-10/abcdefghij-w1280.webp 1280w",
    );
    expect(img).toHaveAttribute("width", "1600");
    expect(img).toHaveAttribute("height", "1067");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).not.toHaveAttribute("fetchpriority");
  });

  it("fetches the page's main photo first", () => {
    render(<MediaImage image={image(made("image/jpeg", "jpg", 960))} sizes="100vw" priority />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("says nothing when it is a face in a group or a photo its words describe (D97)", () => {
    const { container } = render(
      <MediaImage image={image(made("image/png", "png", 480), "A nurse")} sizes="40px" decorative />,
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("is hidden from screen readers when decorative, and absent when it has no made sizes", () => {
    const { container, rerender } = render(<MediaImage image={image(made("image/png", "png", 480), "")} sizes="1px" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    rerender(<MediaImage image={image(made("image/gif", "gif", 480))} sizes="1px" />);
    expect(container).toBeEmptyDOMElement();
  });
});
