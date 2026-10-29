import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UI_TEXT } from "@/constants/messages";
import type { SectionData } from "@/features/content/types";
import { enquiryForms } from "@/features/enquiries/components/EnquiryForms";
import { stubServerEnv, TEST_ENV } from "@tests/support/env";
import { publishedFixture, serviceFixture, siteFixture } from "@tests/support/fixtures/content";

beforeEach(() => stubServerEnv());
afterEach(() => vi.unstubAllEnvs());

const data = (site = siteFixture()): SectionData => ({
  site,
  services: [
    publishedFixture(serviceFixture()),
    publishedFixture(serviceFixture({ name: { en: "School nurse staffing" }, slug: "school-nurse-staffing" })),
  ],
  jobs: [],
  clients: [],
  images: new Map(),
});

const service = () => screen.getByRole("combobox", { name: `${UI_TEXT.service} (${UI_TEXT.optional})` });

describe("enquiryForms", () => {
  it("readies both forms from the published content; the page's FORM section picks one", () => {
    const forms = enquiryForms(data());
    render(<>{forms.CONTACT}</>);
    expect(screen.getByRole("button", { name: UI_TEXT.sendMessage })).toBeInTheDocument();
    render(<>{forms.QUOTE}</>);
    expect(screen.getByRole("option", { name: "School nurse staffing" })).toBeInTheDocument();
  });

  it("starts the Quote form on the service named in the address, only when it is published", () => {
    const { unmount } = render(<>{enquiryForms(data(), "school-nurse-staffing").QUOTE}</>);
    expect(service()).toHaveValue("school-nurse-staffing");
    unmount();
    for (const named of ["no-such-service", ["school-nurse-staffing", "home-nursing-care"], undefined]) {
      const { unmount: next } = render(<>{enquiryForms(data(), named).QUOTE}</>);
      expect(service()).toHaveValue("");
      next();
    }
  });

  it("gives both forms Turnstile's site key from the server's environment, read at request time", () => {
    const forms = enquiryForms(data()) as Record<string, { props: { siteKey: string } }>;
    expect(forms.QUOTE.props.siteKey).toBe(TEST_ENV.TURNSTILE_SITE_KEY);
    expect(forms.CONTACT.props.siteKey).toBe(TEST_ENV.TURNSTILE_SITE_KEY);
  });

  it("offers WhatsApp after sending only when the site has a number", () => {
    const withSite = enquiryForms(data()).QUOTE as { props: { whatsapp: string | null } };
    expect(withSite.props.whatsapp).toBe("+97431306555");
    const withoutSite = enquiryForms({ ...data(), site: null }).CONTACT as { props: { whatsapp: string | null } };
    expect(withoutSite.props.whatsapp).toBeNull();
  });
});
