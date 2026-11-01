"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";

import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { EditorGroup } from "@/components/admin/editor/EditorGroup";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { EditorText } from "@/components/admin/editor/EditorText";
import { ListItems } from "@/components/admin/editor/RichTextField";
import { SeoFields } from "@/components/admin/editor/SeoFields";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type SiteDocument, type SiteDocumentInput, siteDocumentSchema } from "@/lib/validation";

import { SiteClient } from "../api.client";
import type { SiteDraftItem } from "../types";
import { BrochureField } from "./BrochureField";
import { FooterField } from "./FooterField";
import { MapPinField } from "./MapPinField";
import { NavigationField } from "./NavigationField";
import { SocialLinksField } from "./SocialLinksField";

/** Whether the floating WhatsApp button shows (D67): a switch (D134). */
function WhatsAppButton() {
  const { register } = useFormContext();
  return <Switch {...register("whatsappButton")}>{ADMIN_TEXT.whatsappButtonLabel}</Switch>;
}

/**
 * The site's content in the editor (plan §12, §13, D94): one page in groups,
 * with the editor's one bar. Preview opens the home page, which shows the
 * menus, the footer and the contact details.
 */
function SettingsForm({ initial }: { initial: SiteDraftItem }) {
  const [item, setItem] = useState(initial);
  const form = useForm<SiteDocumentInput, unknown, SiteDocument>({
    resolver: zodResolver(siteDocumentSchema),
    defaultValues: initial.draft,
  });
  const refresh = useRevalidate();
  const show = async (saved: SiteDraftItem, reset = true) => {
    setItem(saved);
    if (reset) form.reset(saved.draft);
    await refresh([ADMIN_API_ROUTES.adminSite]);
  };

  return (
    <DraftEditor
      form={form}
      name={ADMIN_TEXT.settings}
      state={item}
      path={ROUTES.home}
      save={async (document) => show(await SiteClient.save(document))}
      publish={async () => show(await SiteClient.publish(), false)}
      discard={async () => show(await SiteClient.discard())}
    >
      <p className="max-w-prose text-ink-2">{ADMIN_TEXT.settingsIntro}</p>
      <EditorGroup title={ADMIN_TEXT.company}>
        <EditorText name="name.en" label={ADMIN_TEXT.companyName} max={TEXT_LIMITS.name} required />
        <EditorText
          name="description.en"
          label={ADMIN_TEXT.companyDescription}
          hint={ADMIN_TEXT.companyDescriptionHint}
          max={TEXT_LIMITS.lede}
          required
          multiline
          rows={3}
        />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.contactDetails}>
        <EditorText
          name="contact.phone"
          label={ADMIN_TEXT.phone}
          hint={ADMIN_TEXT.phoneHint}
          max={TEXT_LIMITS.phone}
          required
        />
        <EditorText
          name="contact.whatsapp"
          label={ADMIN_TEXT.whatsapp}
          hint={ADMIN_TEXT.phoneHint}
          max={TEXT_LIMITS.phone}
          required
        />
        <EditorText name="contact.email" label={ADMIN_TEXT.email} max={TEXT_LIMITS.email} required />
        <fieldset className="grid gap-3">
          <legend className="mb-1 font-semibold">{ADMIN_TEXT.address}</legend>
          <ListItems
            name="contact.address"
            item={ADMIN_TEXT.addressLine}
            max={LIST_LIMITS.addressLines}
            maxLength={TEXT_LIMITS.heading}
          />
        </fieldset>
        <EditorText name="contact.hours.en" label={ADMIN_TEXT.hours} max={TEXT_LIMITS.heading} />
        <EditorText
          name="contact.mapUrl"
          label={ADMIN_TEXT.mapLink}
          hint={ADMIN_TEXT.mapLinkHint}
          max={TEXT_LIMITS.url}
          required
        />
        <MapPinField name="contact.mapPin" />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.socialLinks}>
        <SocialLinksField />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.whatsappButton}>
        <WhatsAppButton />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.headerMenu} hint={ADMIN_TEXT.headerMenuHint}>
        <NavigationField />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.footer} hint={ADMIN_TEXT.footerHint}>
        <FooterField />
      </EditorGroup>
      <SeoFields hint={ADMIN_TEXT.siteSeoHint} required />
      <EditorGroup title={ADMIN_TEXT.brochure}>
        <BrochureField known={item.brochure} />
      </EditorGroup>
    </DraftEditor>
  );
}

/** Settings (R6.6, D94): the site's draft read once, then edited in place until saved. */
export function SettingsEditor() {
  const { data, error, isLoading, mutate } = useApiQuery<SiteDraftItem>(ADMIN_API_ROUTES.adminSite);
  if (error) {
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        <p>{errorMessage(error)}</p>
        <Button variant="secondary" onClick={() => mutate()} className="mt-3">
          {ADMIN_TEXT.tryAgain}
        </Button>
      </Notice>
    );
  }
  if (isLoading || !data) return <EditorLoading />;
  return <SettingsForm initial={data} />;
}
