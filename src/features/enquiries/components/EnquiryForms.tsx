import type { ReactNode } from "react";

import type { SectionForm } from "@/constants/statuses";
import type { SectionData } from "@/features/content/types";
import { getServerEnv } from "@/lib/env/server";

import { ContactForm } from "./ContactForm";
import { QuoteForm } from "./QuoteForm";
import { ShortQuoteForm } from "./ShortQuoteForm";

/**
 * The three forms, ready from a page's published content (plan §10, D130); its FORM
 * section says which one shows. `service` is the address's `?service=`: the
 * Quote form starts on it when it is a published service (§6.8), and on "not
 * sure yet" otherwise. Turnstile's site key is read on the server at request
 * time (plan §10.3), so the site's own keys need no new build.
 */
export function enquiryForms(data: SectionData, service?: string | string[]): Record<SectionForm, ReactNode> {
  const whatsapp = data.site?.contact.whatsapp ?? null;
  const siteKey = getServerEnv().TURNSTILE_SITE_KEY;
  const services = data.services.map(({ published }) => ({ slug: published.slug, name: published.name.en }));
  const chosen = services.find(({ slug }) => slug === service)?.slug ?? "";
  return {
    QUOTE: <QuoteForm services={services} chosen={chosen} whatsapp={whatsapp} siteKey={siteKey} />,
    CONTACT: <ContactForm whatsapp={whatsapp} siteKey={siteKey} />,
    SHORT_QUOTE: <ShortQuoteForm services={services} whatsapp={whatsapp} siteKey={siteKey} />,
  };
}
