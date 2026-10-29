import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PICTOGRAMS, type PictogramName } from "@/assets/brand/pictograms";
import { Reveal } from "@/components/motion/Reveal";
import { TheLine } from "@/components/motion/TheLine";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, RadioGroup } from "@/components/ui/choice";
import { ContactAction } from "@/components/ui/contact-action";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { ImageFrame, LogoTile, Skeleton } from "@/components/ui/frames";
import { LineRow } from "@/components/ui/line-row";
import { LineStart } from "@/components/ui/line-start";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { Select } from "@/components/ui/select";
import { SignPanel } from "@/components/ui/sign-panel";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { SEED_SERVICES, SEED_SITE, seedPages } from "@/db/seed/content";
import { getServerEnv } from "@/lib/env/server";

import { DialogDemo } from "./dialog-demo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: UI_TEXT.kitPreview, robots: { index: false, follow: false } };

/**
 * The kit and the motion system on real content, local and test only (plan
 * D64): what R2.8 reviews and the browser tests check. A harness, not a page
 * of the site: its sample words are the seed's and its own.
 */
export default function KitPage() {
  if (!getServerEnv().KIT_PREVIEW) notFound();
  const sign = seedPages().HOME.sections[0];
  const phone = SEED_SITE.contact.whatsapp;
  const stations = [
    { id: "kit-lines", label: "Lines" },
    { id: "kit-actions", label: "Actions" },
    { id: "kit-fields", label: "Fields" },
    { id: "kit-notices", label: "Notices" },
    { id: "kit-frames", label: "Frames" },
    ...SEED_SERVICES.map((service) => ({ id: service.slug, label: service.name.en })),
  ];

  return (
    <div className="mx-auto grid max-w-site gap-section px-gutter pt-16 pb-section">
      <TheLine stations={stations} tone="deep" />
      {sign.type === "SIGN" ? (
        <SignPanel
          headline={sign.content.headline.en}
          lede={sign.content.lede.en}
          media={
            <ImageFrame ratio="landscape">
              <Skeleton className="size-full rounded-none" />
            </ImageFrame>
          }
        >
          <ContactAction kind="whatsapp" to={phone} variant="onDeep" />
          <ContactAction kind="call" to={phone} variant="onDeepQuiet" />
        </SignPanel>
      ) : null}

      <section id="kit-lines">
        <LineStart>
          <LineRow tone="sky" pictogram="careAtHome" title={UI_TEXT.lineCareAtHome}>
            <ContactAction kind="whatsapp" to={phone} variant="sky" />
            <ContactAction kind="call" to={phone} variant="sky" />
          </LineRow>
          <LineRow tone="deep" pictogram="staffing" title={UI_TEXT.lineStaffing}>
            <ButtonLink href={ROUTES.quote}>{UI_TEXT.requestQuote}</ButtonLink>
          </LineRow>
          <LineRow tone="leaf" pictogram="careers" title={UI_TEXT.lineCareers}>
            <ButtonLink href={ROUTES.careers} variant="leaf">
              {UI_TEXT.careers}
            </ButtonLink>
          </LineRow>
        </LineStart>
      </section>

      <section id="kit-actions" className="grid gap-6">
        <h2 className="text-page font-bold">Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Send message</Button>
          <Button variant="secondary">Choose another</Button>
          <Button pending>Sending</Button>
          <Button disabled>Unavailable</Button>
          <Button size="lg" pictogram="download">
            Brochure
          </Button>
          <ContactAction kind="email" to={SEED_SITE.contact.email} variant="secondary" />
        </div>
        <div className="flex flex-wrap gap-6">
          <ArrowLink href={ROUTES.services}>All services</ArrowLink>
          <ArrowLink href={ROUTES.careers}>Open jobs</ArrowLink>
        </div>
        <div className="flex flex-wrap gap-6 text-navy">
          {(Object.keys(PICTOGRAMS) as PictogramName[]).map((name) => (
            <Pictogram key={name} name={name} size="lg" label={name} />
          ))}
        </div>
      </section>

      <section id="kit-fields" className="grid max-w-xl gap-6">
        <h2 className="text-page font-bold">Fields</h2>
        <Field label="Full name" required>
          <TextInput name="name" autoComplete="name" defaultValue="Mariam Ali" />
        </Field>
        <Field
          label="Phone"
          hint="A Qatar number, or one with its country code."
          error="Phone must be a Qatar number (8 digits) or start with a country code, like +44."
          required
        >
          <TextInput name="phone" type="tel" autoComplete="tel" defaultValue="3130 655" />
        </Field>
        <Field label="Service">
          <Select name="service" defaultValue="">
            <option value="">Not sure yet</option>
            {SEED_SERVICES.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name.en}
              </option>
            ))}
          </Select>
        </Field>
        <RadioGroup
          legend="Preferred contact"
          name="contact"
          options={[
            { value: "WHATSAPP", label: "WhatsApp" },
            { value: "CALL", label: "A call" },
            { value: "EMAIL", label: "Email" },
          ]}
          defaultChecked={false}
        />
        <Field label="Message" required>
          <TextArea name="message" />
        </Field>
        <Field label="CV" hint="PDF, DOC or DOCX, up to 5 MB." required>
          <FileInput name="cv" accept=".pdf,.doc,.docx" />
        </Field>
        <Checkbox name="consent" required error="Please agree to the privacy notice.">
          I agree to the privacy notice.
        </Checkbox>
        <div>
          <DialogDemo label="Open a dialog" title="Before you send" body="We reply as soon as we can." />
        </div>
      </section>

      <section id="kit-notices" className="grid max-w-xl gap-4">
        <h2 className="text-page font-bold">Notices</h2>
        <Notice tone="success" title="Thank you. Your message is on its way.">
          We reply as soon as we can. WhatsApp is the fastest way to reach us.
        </Notice>
        <Notice tone="info" title="Applications close at midnight in Doha." />
        <Notice tone="error" title="Your message was not sent.">
          Please check the highlighted fields.
        </Notice>
      </section>

      <section id="kit-frames" className="grid gap-6">
        <h2 className="text-page font-bold">Frames</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ImageFrame ratio="portrait" credit="Photo: licensed stock">
            <Skeleton className="size-full rounded-none" />
          </ImageFrame>
          <LogoTile>
            <Skeleton className="h-10 w-32" />
          </LogoTile>
          <div className="grid content-start gap-3" aria-busy="true">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </section>

      {SEED_SERVICES.map((service) => (
        <section key={service.slug} id={service.slug} className="grid gap-4">
          <h2 className="text-page font-bold">{service.name.en}</h2>
          <Reveal className="max-w-measure text-lead text-ink-2">
            <p>{service.summary.en}</p>
          </Reveal>
          <Reveal className="max-w-measure">
            {service.description.map((block) =>
              block.type === "paragraph" ? <p key={block.text.en}>{block.text.en}</p> : null,
            )}
          </Reveal>
        </section>
      ))}
    </div>
  );
}
