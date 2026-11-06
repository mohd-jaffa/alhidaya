"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { SiteForm } from "@/components/site/SiteForm";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { TEXT_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";

import { EnquiryFormClient } from "../form.client";

const schema = () => import("@/lib/validation/schemas/enquiries").then((module) => module.shortQuoteFormSchema);

/**
 * Home's short quote (D130): the name and mobile side by side, the email and
 * the service, then the message; sent as a Quote, to the same inbox and
 * email (plan §10.4). Its questions are fixed in code, as the other forms'.
 */
export function ShortQuoteForm({
  services,
  whatsapp,
  siteKey,
}: {
  services: readonly { slug: string; name: string }[];
  whatsapp: string | null;
  /** Turnstile's site key (plan §10.3). */
  siteKey: string;
}) {
  return (
    <SiteForm
      schema={schema}
      send={(values) => EnquiryFormClient.submit("SHORT_QUOTE", values)}
      action={UI_TEXT.sendShortQuote}
      sent={UI_TEXT.quoteSent}
      notSent={UI_TEXT.quoteNotSent}
      whatsapp={whatsapp}
      botCheck={{ siteKey, action: "quote" }}
      columns
    >
      {(errors) => (
        <>
          <Field label={UI_TEXT.yourName} required error={errors.name}>
            <TextInput name="name" autoComplete="name" placeholder={UI_TEXT.fullName} maxLength={TEXT_LIMITS.name} />
          </Field>
          <Field label={UI_TEXT.mobile} required error={errors.phone}>
            <TextInput
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={UI_TEXT.countryCodePlaceholder}
              maxLength={TEXT_LIMITS.phone}
            />
          </Field>
          <Field label={UI_TEXT.email} required error={errors.email}>
            <TextInput
              name="email"
              type="email"
              autoComplete="email"
              placeholder={UI_TEXT.emailPlaceholder}
              maxLength={TEXT_LIMITS.email}
            />
          </Field>
          <Field label={UI_TEXT.service} error={errors.service}>
            <Select name="service" defaultValue="">
              <option value="">{UI_TEXT.serviceNotSure}</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={UI_TEXT.message} required error={errors.message}>
              <TextArea
                name="message"
                placeholder={UI_TEXT.shortQuoteMessageHint}
                rows={5}
                maxLength={TEXT_LIMITS.message}
              />
            </Field>
          </div>
        </>
      )}
    </SiteForm>
  );
}
