import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HeaderAction } from "@/components/site/HeaderAction";
import { UI_TEXT } from "@/constants/messages";
import { siteFixture } from "@tests/support/fixtures/content";

describe("HeaderAction (D116)", () => {
  it("downloads the published brochure, as a plain link to the file", async () => {
    const onNavigate = vi.fn();
    render(<HeaderAction site={siteFixture({ brochure: { mediaId: crypto.randomUUID() } })} onNavigate={onNavigate} />);
    const brochure = screen.getByRole("link", { name: UI_TEXT.brochureButton });
    expect(brochure).toHaveAttribute("href", "/brochure");
    expect(brochure).toHaveAttribute("download", "Al-Hidaya-Health-Care-Service-Brochure.pdf");
    expect(brochure).toHaveClass("bg-deep", "rounded-button");
    expect(screen.queryByRole("link", { name: UI_TEXT.requestQuote })).not.toBeInTheDocument();
    await userEvent.click(brochure);
    expect(onNavigate).toHaveBeenCalled();
  });

  it("offers the quote until a brochure is published, and before the site content is", () => {
    const { rerender } = render(<HeaderAction site={siteFixture()} className="w-full" />);
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveAttribute("href", "/request-a-quote");
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toHaveClass("w-full");
    rerender(<HeaderAction site={null} />);
    expect(screen.getByRole("link", { name: UI_TEXT.requestQuote })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: UI_TEXT.brochureButton })).not.toBeInTheDocument();
  });
});
