"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type FieldErrors, type FieldPath, FormProvider, useForm, useFormState } from "react-hook-form";

import { LeaveGuard } from "@/components/admin/LeaveGuard";
import { StatusChip } from "@/components/admin/StatusChip";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";
import { PAGE_NAMES } from "@/constants/messages";
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { PAGE_ROUTES, API_ROUTES } from "@/constants/routes";
import type { PageKey } from "@/constants/sections";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type PageDocument, type PageDocumentInput, pageDocumentSchema } from "@/lib/validation";

import { PagesClient } from "../api.client";
import { countErrors } from "../editor";
import type { PageDraftItem } from "../types";
import { EditorText } from "./EditorText";
import { pageStatus } from "./PageStateChip";
import { SectionList } from "./SectionList";

type Phase = "idle" | "saving" | "publishing" | "discarding";

/** Which section a field's address is in: `sections.3.content.heading.en` is the fourth. */
const sectionOf = (path: string): number | null => {
  const match = /^sections\.(\d+)\./.exec(path);
  return match ? Number(match[1]) : null;
};

/**
 * A page opened in the editor (D88): the bar kept in view with the page's
 * state and Save draft, Preview, Publish and Discard draft; the sections as
 * rows; the page's words for search engines last. What fails to pass the
 * page's checks is marked at its field, its section opened and counted in
 * the bar; leaving with unsaved changes asks first.
 */
function PageForm({ page, state }: { page: PageKey; state: PageDraftItem }) {
  const form = useForm<PageDocumentInput, unknown, PageDocument>({
    resolver: zodResolver(pageDocumentSchema(page)),
    defaultValues: state.draft,
  });
  const { isDirty, errors } = useFormState({ control: form.control });
  const refresh = useRevalidate();
  const root = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [failure, setFailure] = useState<{ title: string; message: string } | null>(null);
  const [publishFailed, setPublishFailed] = useState(false);
  const [published, setPublished] = useState(false);
  const [asking, setAsking] = useState<"publish" | "discard" | null>(null);
  const [toPublish, setToPublish] = useState<PageDocument | null>(null);
  const [discardFailure, setDiscardFailure] = useState<string | null>(null);
  const [lookForError, setLookForError] = useState(0);
  const name = PAGE_NAMES[page];
  const stale = [ADMIN_API_ROUTES.adminPage(page), ADMIN_API_ROUTES.adminPages];

  // Once the section holding the first error is open, its field takes focus.
  useEffect(() => {
    if (lookForError > 0) root.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [lookForError]);

  const openSection = (index: number | null) => {
    if (index !== null) setOpenId(form.getValues(`sections.${index}.id`));
    setLookForError((count) => count + 1);
  };
  const onInvalid = (found: FieldErrors<PageDocumentInput>) => {
    setFailure(null);
    const sections = (found.sections ?? []) as unknown as Record<number, unknown>;
    const first = form.getValues("sections").findIndex((_, index) => sections[index]);
    openSection(first >= 0 ? first : null);
  };
  /** A refusal that names fields marks each where it is (AGENTS.md §12). */
  const markRefused = (error: unknown) => {
    const fields = error instanceof ApiError && Array.isArray(error.details) ? error.details : [];
    for (const { path, message } of fields as { path: string; message: string }[]) {
      // A rule about the whole list sits on its root, as the page's own checks put it.
      const at = (path === "sections" ? "sections.root" : path) as FieldPath<PageDocumentInput>;
      form.setError(at, { type: "server", message });
    }
    if (fields.length > 0) openSection(sectionOf((fields[0] as { path: string }).path));
  };

  const save = async (document: PageDocument): Promise<boolean> => {
    setPhase("saving");
    setFailure(null);
    setPublished(false);
    try {
      const saved = await PagesClient.save({ page, document });
      form.reset(saved.draft);
      await refresh(stale);
      return true;
    } catch (error) {
      markRefused(error);
      setFailure({ title: ADMIN_TEXT.notSaved, message: errorMessage(error) });
      return false;
    } finally {
      setPhase("idle");
    }
  };

  const publish = async () => {
    setAsking(null);
    setPublishFailed(false);
    if (isDirty && !(await save(toPublish!))) return;
    setPhase("publishing");
    try {
      await PagesClient.publish(page);
      await refresh(stale);
      setPublished(true);
    } catch (error) {
      setPublishFailed(true);
      markRefused(error);
      setFailure({ title: ADMIN_TEXT.notPublished, message: errorMessage(error) });
    } finally {
      setPhase("idle");
    }
  };

  const discard = async () => {
    setPhase("discarding");
    setDiscardFailure(null);
    try {
      const current = await PagesClient.discard(page);
      form.reset(current.draft);
      setAsking(null);
      setOpenId(null);
      setFailure(null);
      setPublishFailed(false);
      await refresh(stale);
    } catch (error) {
      setDiscardFailure(errorMessage(error));
    } finally {
      setPhase("idle");
    }
  };

  const status =
    phase === "saving"
      ? { tone: "progress" as const, label: ADMIN_TEXT.saving }
      : phase === "publishing"
        ? { tone: "progress" as const, label: ADMIN_TEXT.publishing }
        : publishFailed
          ? { tone: "error" as const, label: ADMIN_TEXT.publishFailed }
          : isDirty
            ? { tone: "progress" as const, label: ADMIN_TEXT.unsavedChanges }
            : pageStatus(state);
  const busy = phase !== "idle";
  const canPublish = isDirty || state.unpublishedChanges || state.publishedAt === null;
  const canDiscard = state.publishedAt !== null && (isDirty || state.unpublishedChanges);
  const errorCount = countErrors(errors);
  const ruleError = errors.sections?.root?.message;

  return (
    <FormProvider {...form}>
      <LeaveGuard active={isDirty} />
      {/* Kept in view on a desktop; on a phone it would take half the screen, so it scrolls away. */}
      <form
        noValidate
        onSubmit={form.handleSubmit(save, onInvalid)}
        className="z-[5] -mx-gutter -mt-8 border-b border-rule bg-ground px-gutter py-4 lg:sticky lg:top-0 lg:-mx-12 lg:-mt-10 lg:px-12"
      >
        <div className="grid max-w-5xl gap-3">
          <Link
            href={ADMIN_ROUTES.pages}
            className="justify-self-start text-small font-semibold text-deep underline-offset-4 hover:underline"
          >
            {ADMIN_TEXT.pages}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-section font-bold">{name}</h1>
              <StatusChip tone={status.tone}>{status.label}</StatusChip>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canDiscard ? (
                <Button variant="quiet" disabled={busy} onClick={() => setAsking("discard")}>
                  {ADMIN_TEXT.discardDraft}
                </Button>
              ) : null}
              <a
                href={`${API_ROUTES.preview}?path=${encodeURIComponent(PAGE_ROUTES[page])}`}
                target="_blank"
                rel="noopener"
                title={isDirty ? ADMIN_TEXT.previewHint : undefined}
                className={buttonClasses({ variant: "quiet" })}
              >
                <span>{ADMIN_TEXT.preview}</span>
                <Pictogram name="external" size="sm" />
              </a>
              <Button type="submit" variant="secondary" disabled={!isDirty || busy} pending={phase === "saving"}>
                {ADMIN_TEXT.saveDraft}
              </Button>
              <Button
                disabled={!canPublish || busy}
                pending={phase === "publishing"}
                onClick={form.handleSubmit((document) => {
                  setToPublish(document);
                  setAsking("publish");
                }, onInvalid)}
              >
                {ADMIN_TEXT.publish}
              </Button>
            </div>
          </div>
          {isDirty ? <p className="text-small text-ink-2">{ADMIN_TEXT.previewHint}</p> : null}
        </div>
      </form>

      <div ref={root} className="mt-6 grid max-w-5xl gap-6">
        {errorCount > 0 ? (
          <Notice tone="error" title={ADMIN_TEXT.fieldsNeedAttention(errorCount)}>
            <p>{ruleError ?? ADMIN_TEXT.fieldsNeedAttentionBody}</p>
          </Notice>
        ) : null}
        {failure && errorCount === 0 ? (
          <Notice tone="error" title={failure.title}>
            <p>{failure.message}</p>
          </Notice>
        ) : null}
        {published && !isDirty ? (
          <Notice tone="success" title={ADMIN_TEXT.isPublished(name)}>
            <a
              href={PAGE_ROUTES[page]}
              target="_blank"
              rel="noopener"
              className="font-semibold text-deep underline underline-offset-4"
            >
              {ADMIN_TEXT.seeOnSite}
            </a>
          </Notice>
        ) : null}

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

        <section aria-labelledby="seo-heading" className="grid gap-4 border-t border-rule pt-6">
          <div className="grid gap-1">
            <h2 id="seo-heading" className="text-title font-bold">
              {ADMIN_TEXT.seo}
            </h2>
            <p className="text-small text-ink-2">{ADMIN_TEXT.seoHint}</p>
          </div>
          <div className="grid max-w-3xl gap-4">
            <EditorText name="seo.title.en" label={ADMIN_TEXT.seoTitle} max={TEXT_LIMITS.seoTitle} />
            <EditorText
              name="seo.description.en"
              label={ADMIN_TEXT.seoDescription}
              max={TEXT_LIMITS.seoDescription}
              multiline
              rows={2}
            />
          </div>
        </section>
      </div>

      <Dialog open={asking === "publish"} onClose={() => setAsking(null)} title={ADMIN_TEXT.publishTitle(name)}>
        <div className="grid gap-5">
          <p>{isDirty ? ADMIN_TEXT.publishBodyUnsaved : ADMIN_TEXT.publishBody}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={publish}>{ADMIN_TEXT.publish}</Button>
            <Button variant="secondary" onClick={() => setAsking(null)}>
              {ADMIN_TEXT.keepEditing}
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog open={asking === "discard"} onClose={() => setAsking(null)} title={ADMIN_TEXT.discardTitle(name)}>
        <div className="grid gap-5">
          <p>{ADMIN_TEXT.discardBody}</p>
          {discardFailure ? (
            <Notice tone="error" title={ADMIN_TEXT.notDiscarded}>
              {discardFailure}
            </Notice>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button pending={phase === "discarding"} onClick={discard}>
              {phase === "discarding" ? ADMIN_TEXT.discarding : ADMIN_TEXT.discard}
            </Button>
            <Button variant="secondary" onClick={() => setAsking(null)}>
              {ADMIN_TEXT.keepChanges}
            </Button>
          </div>
        </div>
      </Dialog>
    </FormProvider>
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
  if (isLoading || !data) {
    return (
      <div aria-busy="true" aria-label={ADMIN_TEXT.loading} className="grid max-w-5xl gap-3">
        {[0, 1, 2, 3, 4].map((placeholder) => (
          <div key={placeholder} className="h-14 animate-pulse rounded-panel bg-mist" />
        ))}
      </div>
    );
  }
  return <PageForm page={page} state={data} />;
}
