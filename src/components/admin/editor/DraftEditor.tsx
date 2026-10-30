"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
  useFormState,
} from "react-hook-form";

import { LeaveGuard } from "@/components/admin/LeaveGuard";
import { StatusChip } from "@/components/admin/StatusChip";
import { Button, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { API_ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/errors/errorMessage";

import { type DraftState, draftStatus } from "./DraftStateChip";
import { countErrors } from "./errors";

type Phase = "idle" | "saving" | "publishing" | "discarding";

export interface DraftEditorProps<TInput extends FieldValues, TOutput> {
  form: UseFormReturn<TInput, unknown, TOutput>;
  /** What it is called: the bar's heading and the questions asked. */
  name: string;
  /** Where it was opened from, when it has a list to go back to. */
  back?: { href: string; label: string };
  state: DraftState;
  /** Where it shows on the website, for Preview and once published; null while it has none. */
  path: string | null;
  /** Each answers once the server has; a refusal is thrown, and said here. */
  save: (document: TOutput) => Promise<void>;
  publish: () => Promise<void>;
  discard: () => Promise<void>;
  /** What failed its checks, before the first wrong field takes focus: a page opens its section. */
  onInvalid?: (errors: FieldErrors<TInput>) => void;
  /** The fields a refusal named, once each is marked: a page opens the first one's section. */
  onRefused?: (paths: string[]) => void;
  /** A refused field's place in the form, when the server names it differently: a list's rule sits on its root. */
  fieldPath?: (path: string) => string;
  /** A rule about the whole thing, said in place of the general words. */
  ruleError?: string;
  children: ReactNode;
}

/**
 * The editor every piece of content opens in (D88, D92): the bar kept in view
 * with its name, where it stands and Save draft, Preview, Publish and Discard
 * draft; its fields below. Publish and Discard ask first, and Publish saves
 * first; what fails its checks is marked at its field and counted, and the
 * first takes focus; leaving with unsaved changes asks first.
 */
export function DraftEditor<TInput extends FieldValues, TOutput>({
  form,
  name,
  back,
  state,
  path,
  save,
  publish,
  discard,
  onInvalid,
  onRefused,
  fieldPath = (at) => at,
  ruleError,
  children,
}: DraftEditorProps<TInput, TOutput>) {
  const { isDirty, errors } = useFormState({ control: form.control });
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [failure, setFailure] = useState<{ title: string; message: string } | null>(null);
  const [publishFailed, setPublishFailed] = useState(false);
  const [published, setPublished] = useState(false);
  const [asking, setAsking] = useState<"publish" | "discard" | null>(null);
  const [toPublish, setToPublish] = useState<TOutput | null>(null);
  const [discardFailure, setDiscardFailure] = useState<string | null>(null);
  const [lookForError, setLookForError] = useState(0);

  // Once what holds the first error is shown, its field takes focus.
  useEffect(() => {
    if (lookForError > 0) root.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [lookForError]);

  const invalid = (found: FieldErrors<TInput>) => {
    setFailure(null);
    onInvalid?.(found);
    setLookForError((count) => count + 1);
  };
  /** A refusal that names fields marks each where it is (AGENTS.md §12). */
  const markRefused = (error: unknown) => {
    const fields = (error instanceof ApiError && Array.isArray(error.details) ? error.details : []) as {
      path: string;
      message: string;
    }[];
    for (const { path: at, message } of fields) {
      form.setError(fieldPath(at) as FieldPath<TInput>, { type: "server", message });
    }
    if (fields.length > 0) {
      onRefused?.(fields.map((field) => field.path));
      setLookForError((count) => count + 1);
    }
  };

  const runSave = async (document: TOutput): Promise<boolean> => {
    setPhase("saving");
    setFailure(null);
    setPublished(false);
    try {
      await save(document);
      return true;
    } catch (error) {
      markRefused(error);
      setFailure({ title: ADMIN_TEXT.notSaved, message: errorMessage(error) });
      return false;
    } finally {
      setPhase("idle");
    }
  };

  const runPublish = async () => {
    setAsking(null);
    setPublishFailed(false);
    if (isDirty && !(await runSave(toPublish!))) return;
    setPhase("publishing");
    try {
      await publish();
      setPublished(true);
    } catch (error) {
      setPublishFailed(true);
      markRefused(error);
      setFailure({ title: ADMIN_TEXT.notPublished, message: errorMessage(error) });
    } finally {
      setPhase("idle");
    }
  };

  const runDiscard = async () => {
    setPhase("discarding");
    setDiscardFailure(null);
    try {
      await discard();
      setAsking(null);
      setFailure(null);
      setPublishFailed(false);
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
            : draftStatus(state);
  const busy = phase !== "idle";
  const canPublish = isDirty || state.unpublishedChanges || state.publishedAt === null;
  const canDiscard = state.publishedAt !== null && (isDirty || state.unpublishedChanges);
  const errorCount = countErrors(errors);

  return (
    <FormProvider {...form}>
      <LeaveGuard active={isDirty} />
      {/* Kept in view on a desktop; on a phone it would take half the screen, so it scrolls away. */}
      <form
        noValidate
        onSubmit={form.handleSubmit(runSave, invalid)}
        className="z-[5] -mx-gutter -mt-8 border-b border-rule bg-ground px-gutter py-4 lg:sticky lg:top-0 lg:-mx-12 lg:-mt-10 lg:px-12"
      >
        <div className="grid max-w-5xl gap-3">
          {back ? (
            <Link
              href={back.href}
              className="justify-self-start text-small font-semibold text-deep underline-offset-4 hover:underline"
            >
              {back.label}
            </Link>
          ) : null}
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
              {path ? (
                <a
                  href={`${API_ROUTES.preview}?path=${encodeURIComponent(path)}`}
                  target="_blank"
                  rel="noopener"
                  title={isDirty ? ADMIN_TEXT.previewHint : undefined}
                  className={buttonClasses({ variant: "quiet" })}
                >
                  <span>{ADMIN_TEXT.preview}</span>
                  <Pictogram name="external" size="sm" />
                </a>
              ) : null}
              <Button type="submit" variant="secondary" disabled={!isDirty || busy} pending={phase === "saving"}>
                {ADMIN_TEXT.saveDraft}
              </Button>
              <Button
                disabled={!canPublish || busy}
                pending={phase === "publishing"}
                onClick={form.handleSubmit((document) => {
                  setToPublish(document);
                  setAsking("publish");
                }, invalid)}
              >
                {ADMIN_TEXT.publish}
              </Button>
            </div>
          </div>
          {isDirty && path ? <p className="text-small text-ink-2">{ADMIN_TEXT.previewHint}</p> : null}
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
            {path && !state.archivedAt ? (
              <a
                href={path}
                target="_blank"
                rel="noopener"
                className="font-semibold text-deep underline underline-offset-4"
              >
                {ADMIN_TEXT.seeOnSite}
              </a>
            ) : null}
          </Notice>
        ) : null}
        {children}
      </div>

      <Dialog open={asking === "publish"} onClose={() => setAsking(null)} title={ADMIN_TEXT.publishTitle(name)}>
        <div className="grid gap-5">
          <p>{isDirty ? ADMIN_TEXT.publishBodyUnsaved : ADMIN_TEXT.publishBody}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={runPublish}>{ADMIN_TEXT.publish}</Button>
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
            <Button pending={phase === "discarding"} onClick={runDiscard}>
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
