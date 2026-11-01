"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { SiteForm } from "@/components/site/SiteForm";
import { Field } from "@/components/ui/field";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { TEXT_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";

import { EnquiryFormClient } from "../form.client";

const schema = () => import("@/lib/validation/schemas/enquiries").then((module) => module.contactFormSchema);

/** The Contact form (plan §10.2): name, phone, email and message. */
export function ContactForm({ whatsapp, siteKey }: { whatsapp: string | null; siteKey: string }) {
  return (
    <SiteForm
      schema={schema}
      send={(values) => EnquiryFormClient.submit("CONTACT", values)}
      action={UI_TEXT.sendMessage}
      sent={UI_TEXT.messageSent}
      notSent={UI_TEXT.messageNotSent}
      whatsapp={whatsapp}
      botCheck={{ siteKey, action: "contact" }}
    >
      {(errors) => (
        <>
          <Field label={UI_TEXT.yourName} required error={errors.name}>
            <TextInput name="name" autoComplete="name" maxLength={TEXT_LIMITS.name} />
          </Field>
          <Field label={UI_TEXT.phone} hint={UI_TEXT.phoneHint} required error={errors.phone}>
            <TextInput name="phone" type="tel" autoComplete="tel" maxLength={TEXT_LIMITS.phone} />
          </Field>
          <Field label={UI_TEXT.email} required error={errors.email}>
            <TextInput name="email" type="email" autoComplete="email" maxLength={TEXT_LIMITS.email} />
          </Field>
          <Field label={UI_TEXT.message} required error={errors.message}>
            <TextArea name="message" maxLength={TEXT_LIMITS.message} />
          </Field>
        </>
      )}
    </SiteForm>
  );
}
