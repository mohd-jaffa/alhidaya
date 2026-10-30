"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";

import { AskedAction } from "@/components/admin/AskedAction";
import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { EditorGroup } from "@/components/admin/editor/EditorGroup";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { EditorText } from "@/components/admin/editor/EditorText";
import { PhotoField } from "@/components/admin/editor/PhotoField";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { TEXT_LIMITS } from "@/constants/limits";
import { ROUTES } from "@/constants/routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type ClientDocument, type ClientDocumentInput, clientDocumentSchema } from "@/lib/validation";

import { ClientsClient } from "../api.client";
import type { ClientDraftItem } from "../types";

/** A new client logo, blank for the admin to fill: refused until it has its name and logo. */
const BLANK: DefaultValues<ClientDocumentInput> = { name: { en: "" }, url: "" };

/**
 * A client logo in the editor (plan §11, D92): the organisation, its logo
 * from the library, its website, and taking it off the website. A new one is
 * made on its first save, and the address bar then names it. Its logo shows
 * on the pages with the clients' row, so Preview opens the home page.
 */
function ClientForm({ initial }: { initial: ClientDraftItem | null }) {
  const [item, setItem] = useState(initial);
  // Publish may follow a first save at once, before the screen has drawn it again.
  const id = useRef(initial?.id ?? null);
  const form = useForm<ClientDocumentInput, unknown, ClientDocument>({
    resolver: zodResolver(clientDocumentSchema),
    defaultValues: initial ? { ...initial.draft, url: initial.draft.url ?? "" } : BLANK,
  });
  const refresh = useRevalidate();
  const show = async (saved: ClientDraftItem, reset = true) => {
    // Made by its first save: the address bar names it from now on, without leaving the editor.
    if (id.current !== saved.id) {
      window.history.replaceState(null, "", ADMIN_ROUTES.client(saved.id));
    }
    id.current = saved.id;
    setItem(saved);
    if (reset) form.reset({ ...saved.draft, url: saved.draft.url ?? "" });
    await refresh([ADMIN_API_ROUTES.adminClients, ADMIN_API_ROUTES.adminClient(saved.id)]);
  };
  const name = item?.draft.name.en || ADMIN_TEXT.newClient;

  return (
    <DraftEditor
      form={form}
      name={name}
      back={{ href: ADMIN_ROUTES.clients, label: ADMIN_TEXT.clients }}
      state={item ?? { publishedAt: null, unpublishedChanges: true }}
      path={item ? ROUTES.home : null}
      save={async (document) =>
        show(id.current ? await ClientsClient.save({ id: id.current, document }) : await ClientsClient.create(document))
      }
      publish={async () => show(await ClientsClient.publish(id.current!), false)}
      discard={async () => show(await ClientsClient.discard(id.current!))}
    >
      <EditorGroup title={ADMIN_TEXT.aboutClient}>
        <EditorText name="name.en" label={ADMIN_TEXT.organisation} max={TEXT_LIMITS.heading} required />
        <PhotoField name="logo" label={ADMIN_TEXT.logo} required logo />
        <EditorText name="url" label={ADMIN_TEXT.website} hint={ADMIN_TEXT.websiteHint} max={TEXT_LIMITS.url} />
      </EditorGroup>
      {item ? (
        <EditorGroup title={ADMIN_TEXT.onTheSite}>
          {item.archivedAt ? <p>{ADMIN_TEXT.isArchived}</p> : null}
          <AskedAction
            label={item.archivedAt ? ADMIN_TEXT.restore : ADMIN_TEXT.archive}
            title={item.archivedAt ? ADMIN_TEXT.restoreTitle(name) : ADMIN_TEXT.archiveTitle(name)}
            body={item.archivedAt ? ADMIN_TEXT.restoreBody : ADMIN_TEXT.archiveClientBody}
            keep={ADMIN_TEXT.keepEditing}
            failed={item.archivedAt ? ADMIN_TEXT.notRestored : ADMIN_TEXT.notArchived}
            act={() => ClientsClient.setArchived({ id: item.id, archived: !item.archivedAt })}
            afterwards={(saved) => show(saved, false)}
          />
        </EditorGroup>
      ) : null}
    </DraftEditor>
  );
}

/** A saved client logo's editor: its draft read once, then edited in place until saved. */
function SavedClient({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useApiQuery<ClientDraftItem>(ADMIN_API_ROUTES.adminClient(id));
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
  return <ClientForm initial={data} />;
}

/** A client logo's editor (R6.5, D92): a new one when there is no id yet. */
export function ClientEditor({ id }: { id: string | null }) {
  return id ? <SavedClient id={id} /> : <ClientForm initial={null} />;
}
