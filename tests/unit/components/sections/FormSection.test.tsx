import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormSection } from "@/components/sections/FormSection";
import { UI_TEXT } from "@/constants/messages";
import { contentFixture, siteFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

const en = <T,>(value: T) => ({ en: value });

describe("FormSection", () => {
  it("puts the admin's heading and text above the form the page gives", () => {
    const content = { ...contentFixture("FORM"), text: en("We reply within the day.") };
    render(
      <FormSection
        anchor="form"
        content={content}
        form={<form aria-label="Contact form" />}
        kind="CONTACT"
        site={null}
      />,
    );
    expect(screen.getByRole("region", { name: "Send a message" })).toBeInTheDocument();
    expect(screen.getByText("We reply within the day.")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
  });

  it("puts the site's email beside the form as a chip that writes to it (D97)", () => {
    render(
      <FormSection anchor="form" content={contentFixture("FORM")} form={null} kind="QUOTE" site={siteFixture()} />,
    );
    const email = siteFixture().contact.email;
    expect(screen.getByRole("link", { name: email })).toHaveAttribute("href", `mailto:${email}`);
  });

  it("needs no text", () => {
    render(<FormSection anchor="form" content={contentFixture("FORM")} form={null} kind="CONTACT" site={null} />);
    expect(screen.getByRole("region").querySelector("p")).toBeNull();
  });

  it("matches the short quote reference with a rounded blue panel, contact tiles and a plain white card (D151)", () => {
    const content = {
      ...contentFixture("FORM"),
      heading: en("Get a free quote"),
      text: en("Tell us who needs care."),
      form: "SHORT_QUOTE" as const,
    };
    render(
      <FormSection
        anchor="form"
        content={content}
        form={<form aria-label="Short quote" />}
        kind="SHORT_QUOTE"
        site={siteFixture()}
      />,
    );
    const band = screen.getByRole("region", { name: "Get a free quote" });
    expect(band).toHaveClass("bg-mist");
    expect(band.parentElement).toHaveClass("rounded-card");
    const site = siteFixture();
    expect(within(band).getByRole("link", { name: new RegExp(UI_TEXT.whatsappUs) })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me"),
    );
    expect(within(band).getByRole("link", { name: new RegExp(UI_TEXT.callUs247) })).toHaveAttribute(
      "href",
      `tel:${site.contact.phone}`,
    );
    expect(within(band).getByRole("link", { name: new RegExp(UI_TEXT.emailUs) })).toHaveAttribute(
      "href",
      `mailto:${site.contact.email}`,
    );
    expect(within(band).getByText("Tell us who needs care.")).toBeInTheDocument();
    expect(band.querySelectorAll("a.bg-deep\\/10")).toHaveLength(3);
    expect(band.querySelector("p.bg-deep")).toBeNull();
    expect(within(band).getByRole("form", { name: "Short quote" }).parentElement).toHaveClass("shadow-float");
    expect(within(band).getByRole("form", { name: "Short quote" })).toBeInTheDocument();
  });

  it("sets the short quote without its ways to reach before the site content is published, and without words", () => {
    const content = { ...contentFixture("FORM"), heading: en("Get a free quote"), form: "SHORT_QUOTE" as const };
    render(<FormSection anchor="form" content={content} form={null} kind="SHORT_QUOTE" site={null} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Get a free quote" }).querySelector("p.text-lead")).toBeNull();
  });

  it("on Contact, keeps the message panel and office on the pale-green band (D145)", () => {
    render(
      <FormSection
        anchor="form"
        content={contentFixture("FORM")}
        form={<form aria-label="Contact form" />}
        kind="CONTACT"
        site={siteFixture()}
        band
      />,
    );
    const band = screen.getByRole("region", { name: "Send a message" });
    expect(band).toHaveClass("bg-deep");
    expect(band.querySelector(".contact-message-panel")).toHaveClass("bg-leaf-pale");
    expect(within(band).getByRole("heading", { name: UI_TEXT.visitOffice })).toBeInTheDocument();
    expect(within(band).getByRole("form", { name: "Contact form" })).toBeInTheDocument();
  });
});
