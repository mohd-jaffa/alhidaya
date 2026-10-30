"use client";

import { SiteForm } from "@/components/site/SiteForm";
import { choiceOptions, RadioGroup } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { TEXT_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import { CARE_FOR, CARE_FOR_LABELS, CONTACT_METHOD_LABELS, CONTACT_METHODS } from "@/constants/statuses";

import { EnquiriesClient } from "../api.client";

const schema = () => import("@/lib/validation/schemas/enquiries").then((module) => module.quoteFormSchema);

/**
 * The Quote form (plan §10.1): who the care is for, the service (from the
 * published services, chosen already when the visitor came from one), how
 * to reach them, and their message.
 */
export function QuoteForm({
  services,
  chosen,
  whatsapp,
  siteKey,
}: {
  services: readonly { slug: string; name: string }[];
  /** The service the visitor came from, or "" for none. */
  chosen: string;
  whatsapp: string | null;
  /** Turnstile's site key (plan §10.3). */
  siteKey: string;
}) {
  return (
    <SiteForm
      schema={schema}
      send={(values) => EnquiriesClient.submit("QUOTE", values)}
      action={UI_TEXT.sendQuote}
      sent={UI_TEXT.quoteSent}
      notSent={UI_TEXT.quoteNotSent}
      whatsapp={whatsapp}
      botCheck={{ siteKey, action: "quote" }}
    >
      {(errors) => (
        <>
          <Field label={UI_TEXT.yourName} required error={errors.name}>
            <TextInput name="name" autoComplete="name" maxLength={TEXT_LIMITS.name} />
          </Field>
          <Field label={UI_TEXT.organisation} error={errors.organisation}>
            <TextInput name="organisation" autoComplete="organization" maxLength={TEXT_LIMITS.line} />
          </Field>
          <RadioGroup
            legend={UI_TEXT.careFor}
            name="careFor"
            options={choiceOptions(CARE_FOR, CARE_FOR_LABELS)}
            required
            error={errors.careFor}
          />
          <Field label={UI_TEXT.service} hint={UI_TEXT.serviceHint} error={errors.service}>
            <Select name="service" defaultValue={chosen}>
              <option value="">{UI_TEXT.serviceNotSure}</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={UI_TEXT.phone} hint={UI_TEXT.phoneHint} required error={errors.phone}>
            <TextInput name="phone" type="tel" autoComplete="tel" maxLength={TEXT_LIMITS.phone} />
          </Field>
          <Field label={UI_TEXT.email} required error={errors.email}>
            <TextInput name="email" type="email" autoComplete="email" maxLength={TEXT_LIMITS.email} />
          </Field>
          <RadioGroup
            legend={UI_TEXT.contactMethod}
            name="contactMethod"
            options={choiceOptions(CONTACT_METHODS, CONTACT_METHOD_LABELS)}
            required
            error={errors.contactMethod}
          />
          <Field label={UI_TEXT.message} hint={UI_TEXT.quoteMessageHint} required error={errors.message}>
            <TextArea name="message" maxLength={TEXT_LIMITS.message} />
          </Field>
        </>
      )}
    </SiteForm>
  );
}
