"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type FieldErrors, useForm, useFormState } from "react-hook-form";

import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { SeoFields } from "@/components/admin/editor/SeoFields";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { PAGE_NAMES } from "@/constants/messages";
import { PAGE_ROUTES } from "@/constants/routes";
import type { PageKey } from "@/constants/sections";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type PageDocument, type PageDocumentInput, pageDocumentSchema } from "@/lib/validation";

import { PagesClient } from "../api.client";
import type { PageDraftItem } from "../types";
import { SectionList } from "./SectionList";

/** Which section a field's address is in: `sections.3.content.heading.en` is the fourth. */
const sectionOf = (path: string): number | null => {
  const match = /^sections\.(\d+)\./.exec(path);
  return match ? Number(match[1]) : null;
};

/**
 * A page opened in the editor (D88): the sections as rows, the page's words
 * for search engines last. What fails the page's checks opens its section.
 */
function PageForm({ page, state }: { page: PageKey; state: PageDraftItem }) {
  const form = useForm<PageDocumentInput, unknown, PageDocument>({
    resolver: zodResolver(pageDocumentSchema(page)),
    defaultValues: state.draft,
  });
  const { errors } = useFormState({ control: form.control });
  const refresh = useRevalidate();
  const [openId, setOpenId] = useState<string | null>(null);
  const stale = [ADMIN_API_ROUTES.adminPage(page), ADMIN_API_ROUTES.adminPages];

  const openSection = (index: number | null) => {
    if (index !== null) setOpenId(form.getValues(`sections.${index}.id`));
  };
  const onInvalid = (found: FieldErrors<PageDocumentInput>) => {
    const sections = (found.sections ?? []) as unknown as Record<number, unknown>;
    const first = form.getValues("sections").findIndex((_, index) => sections[index]);
    openSection(first >= 0 ? first : null);
  };

  return (
    <DraftEditor
      form={form}
      name={PAGE_NAMES[page]}
      back={{ href: ADMIN_ROUTES.pages, label: ADMIN_TEXT.pages }}
      state={state}
      path={PAGE_ROUTES[page]}
      save={async (document) => {
        const saved = await PagesClient.save({ page, document });
        form.reset(saved.draft);
        await refresh(stale);
      }}
      publish={async () => {
        await PagesClient.publish(page);
        await refresh(stale);
      }}
      discard={async () => {
        const current = await PagesClient.discard(page);
        form.reset(current.draft);
        setOpenId(null);
        await refresh(stale);
      }}
      onInvalid={onInvalid}
      onRefused={(paths) => openSection(sectionOf(paths[0]))}
      // A rule about the whole list sits on its root, as the page's own checks put it.
      fieldPath={(path) => (path === "sections" ? "sections.root" : path)}
      ruleError={errors.sections?.root?.message}
    >
      <section aria-labelledby="sections-heading" className="grid gap-3">
        <div className="grid gap-1">
          <h2 id="sections-heading" className="text-title font-bold">
            {ADMIN_TEXT.sections}
          </h2>
          {/* Phones have no drag and drop, so the hint waits for a wider screen. */}
          <p className="hidden text-small text-ink-2 sm:block">{ADMIN_TEXT.sectionsHint}</p>
        </div>
        <SectionList page={page} openId={openId} onOpen={setOpenId} />
      </section>
      <SeoFields hint={ADMIN_TEXT.seoHint} />
    </DraftEditor>
  );
}

/** A page's editor (R6.3): its draft read once, then edited in place until saved. */
export function PageEditor({ page }: { page: PageKey }) {
  const { data, error, isLoading, mutate } = useApiQuery<PageDraftItem>(ADMIN_API_ROUTES.adminPage(page));
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
  return <PageForm page={page} state={data} />;
}
