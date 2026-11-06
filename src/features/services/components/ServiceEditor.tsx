"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { AskedAction } from "@/components/admin/AskedAction";
import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { EditorGroup } from "@/components/admin/editor/EditorGroup";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { EditorText } from "@/components/admin/editor/EditorText";
import { PhotoField } from "@/components/admin/editor/PhotoField";
import { PointsField } from "@/components/admin/editor/PointsField";
import { RichTextField } from "@/components/admin/editor/RichTextField";
import { SeoFields } from "@/components/admin/editor/SeoFields";
import { SlugField } from "@/components/admin/editor/SlugField";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type ServiceDocument, type ServiceDocumentInput, serviceDocumentSchema } from "@/lib/validation";

import { ServicesClient } from "../api.client";
import type { ServiceDraftItem } from "../types";
import { ServiceHeaderButtons } from "./ServiceHeaderButtons";

/** A new service, blank for the admin to fill: refused until it is. */
const BLANK: ServiceDocumentInput = {
  name: { en: "" },
  slug: "",
  audience: "FAMILIES",
  summary: { en: "" },
  description: [{ type: "paragraph", text: { en: "" } }],
  included: [],
  headerButtons: [],
  forWhom: { en: "" },
  image: null,
  seo: { title: { en: "" }, description: { en: "" } },
};

/**
 * A service in the editor (D92): what it is and its address, its
 * description, what's included, its photo, its words for search engines,
 * and taking it off the website. A new one is made on its first save, and
 * the address bar then names it.
 */
function ServiceForm({ initial }: { initial: ServiceDraftItem | null }) {
  const [item, setItem] = useState(initial);
  // Publish may follow a first save at once, before the screen has drawn it again.
  const id = useRef(initial?.id ?? null);
  const form = useForm<ServiceDocumentInput, unknown, ServiceDocument>({
    resolver: zodResolver(serviceDocumentSchema),
    defaultValues: initial?.draft ?? BLANK,
  });
  const refresh = useRevalidate();
  const show = async (saved: ServiceDraftItem, reset = true) => {
    // Made by its first save: the address bar names it from now on, without leaving the editor.
    if (id.current !== saved.id) {
      window.history.replaceState(null, "", ADMIN_ROUTES.service(saved.id));
    }
    id.current = saved.id;
    setItem(saved);
    if (reset) form.reset(saved.draft);
    await refresh([ADMIN_API_ROUTES.adminServices, ADMIN_API_ROUTES.adminService(saved.id)]);
  };
  const name = item?.draft.name.en || ADMIN_TEXT.newService;

  return (
    <DraftEditor
      form={form}
      name={name}
      back={{ href: ADMIN_ROUTES.services, label: ADMIN_TEXT.services }}
      state={item ?? { publishedAt: null, unpublishedChanges: true }}
      path={item ? ROUTES.service(item.draft.slug) : null}
      save={async (document) => {
        const saved = id.current
          ? await ServicesClient.save({ id: id.current, document })
          : await ServicesClient.create(document);
        await show(saved);
      }}
      publish={async () => show(await ServicesClient.publish(id.current!), false)}
      discard={async () => show(await ServicesClient.discard(id.current!))}
    >
      <EditorGroup title={ADMIN_TEXT.aboutService}>
        <EditorText name="name.en" label={ADMIN_TEXT.serviceName} max={TEXT_LIMITS.name} required />
        <SlugField from="name.en" address={ROUTES.service} follow={!item?.publishedAt} />
        <EditorText
          name="summary.en"
          label={ADMIN_TEXT.summary}
          hint={ADMIN_TEXT.summaryHint}
          max={TEXT_LIMITS.lede}
          required
          multiline
          rows={3}
        />
        <PhotoField name="image" label={ADMIN_TEXT.photo} />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.serviceButtons} hint={ADMIN_TEXT.serviceButtonsHint}>
        <ServiceHeaderButtons />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.description}>
        <RichTextField name="description" label={ADMIN_TEXT.description} hideLabel />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.included} hint={ADMIN_TEXT.includedHint}>
        <PointsField
          name="included"
          label={ADMIN_TEXT.included}
          item={ADMIN_TEXT.includedItem}
          max={LIST_LIMITS.included}
          hideLabel
        />
      </EditorGroup>
      <SeoFields hint={ADMIN_TEXT.serviceSeoHint} />
      {item ? (
        <EditorGroup title={ADMIN_TEXT.onTheSite}>
          {item.archivedAt ? <p>{ADMIN_TEXT.isArchived}</p> : null}
          <AskedAction
            label={item.archivedAt ? ADMIN_TEXT.restore : ADMIN_TEXT.archive}
            title={item.archivedAt ? ADMIN_TEXT.restoreTitle(name) : ADMIN_TEXT.archiveTitle(name)}
            body={item.archivedAt ? ADMIN_TEXT.restoreBody : ADMIN_TEXT.archiveServiceBody}
            keep={ADMIN_TEXT.keepEditing}
            failed={item.archivedAt ? ADMIN_TEXT.notRestored : ADMIN_TEXT.notArchived}
            act={() => ServicesClient.setArchived({ id: item.id, archived: !item.archivedAt })}
            afterwards={(saved) => show(saved, false)}
          />
        </EditorGroup>
      ) : null}
    </DraftEditor>
  );
}

/** A saved service's editor: its draft read once, then edited in place until saved. */
function SavedService({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useApiQuery<ServiceDraftItem>(ADMIN_API_ROUTES.adminService(id));
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
  return <ServiceForm initial={data} />;
}

/** A service's editor (R6.4, D92): a new one when there is no id yet. */
export function ServiceEditor({ id }: { id: string | null }) {
  return id ? <SavedService id={id} /> : <ServiceForm initial={null} />;
}
