import type { ReactNode } from "react";

import type { FormKind } from "@/constants/statuses";
import type { SectionData } from "@/features/content/types";

import { ContactForm } from "./ContactForm";
import { QuoteForm } from "./QuoteForm";

/**
 * Both forms, ready from a page's published content (plan §10); its FORM
 * section says which one shows. `service` is the address's `?service=`: the
 * Quote form starts on it when it is a published service (§6.8), and on "not
 * sure yet" otherwise.
 */
export function enquiryForms(data: SectionData, service?: string | string[]): Record<FormKind, ReactNode> {
  const whatsapp = data.site?.contact.whatsapp ?? null;
  const services = data.services.map(({ published }) => ({ slug: published.slug, name: published.name.en }));
  const chosen = services.find(({ slug }) => slug === service)?.slug ?? "";
  return {
    QUOTE: <QuoteForm services={services} chosen={chosen} whatsapp={whatsapp} />,
    CONTACT: <ContactForm whatsapp={whatsapp} />,
  };
}
