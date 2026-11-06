import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContactMessageSection } from "@/components/sections/ContactMessageSection";
import { UI_TEXT } from "@/constants/messages";
import { contentFixture, siteFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

describe("ContactMessageSection", () => {
  it("keeps the form, published office, satellite map and directions together", () => {
    const content = { ...contentFixture("FORM"), text: { en: "Tell us how we can help." } };
    const site = siteFixture();
    const { rerender } = render(
      <ContactMessageSection anchor="form" content={content} form={<form aria-label="Message" />} site={site} />,
    );
    expect(screen.getByRole("region", { name: content.heading.en })).toHaveClass("bg-deep");
    expect(screen.getByRole("form", { name: "Message" }).closest(".contact-message-panel")).toHaveClass("bg-leaf-pale");
    expect(screen.getByRole("form", { name: "Message" }).parentElement).toHaveClass("shadow-float");
    expect(screen.getByText(content.text.en)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: UI_TEXT.visitOffice })).toBeInTheDocument();
    expect(screen.getByText(site.contact.address[0].en)).toBeInTheDocument();
    expect(screen.getByTitle(UI_TEXT.satelliteMap).parentElement).toHaveClass("shadow-map");
    expect(screen.getByTitle(UI_TEXT.satelliteMap)).toHaveAttribute("src", expect.stringContaining("t=k"));
    expect(screen.getByRole("link", { name: UI_TEXT.openInMaps })).toHaveAttribute("href", site.contact.mapUrl);
    rerender(<ContactMessageSection anchor="form" content={contentFixture("FORM")} form={null} site={null} />);
    expect(screen.queryByTitle(UI_TEXT.satelliteMap)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(content.text.en)).not.toBeInTheDocument();
  });
});
