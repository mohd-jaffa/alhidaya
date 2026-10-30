import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormSection } from "@/components/sections/FormSection";
import { contentFixture } from "@tests/support/fixtures/content";

const en = <T,>(value: T) => ({ en: value });

describe("FormSection", () => {
  it("puts the admin's heading and text above the form the page gives", () => {
    const content = { ...contentFixture("FORM"), text: en("We reply within the day.") };
    render(<FormSection anchor="form" content={content} form={<form aria-label="Contact form" />} email={null} />);
    expect(screen.getByRole("region", { name: "Send a message" })).toBeInTheDocument();
    expect(screen.getByText("We reply within the day.")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
  });

  it("puts the site's email beside the form as a chip that writes to it (D97)", () => {
    render(<FormSection anchor="form" content={contentFixture("FORM")} form={null} email="info@alhidaya.qa" />);
    expect(screen.getByRole("link", { name: "info@alhidaya.qa" })).toHaveAttribute("href", "mailto:info@alhidaya.qa");
  });

  it("needs no text", () => {
    render(<FormSection anchor="form" content={contentFixture("FORM")} form={null} email={null} />);
    expect(screen.getByRole("region").querySelector("p")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
