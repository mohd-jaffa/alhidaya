"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { DiskMeter } from "@/components/admin/DiskMeter";
import { EditorGroup } from "@/components/admin/editor/EditorGroup";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { useEditorError } from "@/components/admin/editor/EditorText";
import { LeaveGuard } from "@/components/admin/LeaveGuard";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { CV_EXPIRY_DAYS, RETENTION_DAYS } from "@/constants/limits";
import { dohaDateTime } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type OperationsInput, type OperationsPayload, operationsSchema } from "@/lib/validation";

import { OperationsClient } from "../api.client";
import type { OperationsViewItem } from "../types";
import { RecipientsField } from "./RecipientsField";

/** A number of days, from its least to its most. */
function DaysField({
  name,
  label,
  range,
}: {
  name: "retentionDays" | "cvExpiryDays";
  label: string;
  range: { min: number; max: number };
}) {
  const error = useEditorError(name);
  const { register } = useFormContext<OperationsInput>();
  return (
    <Field label={label} hint={ADMIN_TEXT.daysHint(range.min, range.max)} error={error} required>
      <TextInput
        type="number"
        inputMode="numeric"
        min={range.min}
        max={range.max}
        className="sm:max-w-40"
        {...register(name, { valueAsNumber: true })}
      />
    </Field>
  );
}

/**
 * How the site runs (plan §13, §18, §21.2, D95): who receives the forms'
 * emails and how long things are kept, saved at once (a keeping period
 * changed is asked first, as what it deletes can't come back); each upload
 * folder's room; and what the nightly clean-up last did.
 */
function OperationsForm({ initial }: { initial: OperationsViewItem }) {
  const [view, setView] = useState(initial);
  const form = useForm<OperationsInput, unknown, OperationsPayload>({
    resolver: zodResolver(operationsSchema),
    defaultValues: initial.operations,
  });
  const refresh = useRevalidate();
  const [asking, setAsking] = useState<OperationsPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const save = async (next: OperationsPayload) => {
    setAsking(null);
    setSaving(true);
    setFailure(null);
    try {
      const answer = await OperationsClient.save(next);
      setView(answer);
      form.reset(answer.operations);
      await refresh([ADMIN_API_ROUTES.adminOperations]);
      setSaved(true);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const submit = (next: OperationsPayload) => {
    setSaved(false);
    const keeping =
      next.retentionDays !== view.operations.retentionDays || next.cvExpiryDays !== view.operations.cvExpiryDays;
    if (keeping) setAsking(next);
    else void save(next);
  };
  const last = view.lastPurge;

  return (
    <FormProvider {...form}>
      <LeaveGuard active={form.formState.isDirty} />
      <div className="grid max-w-5xl gap-6">
        <div className="grid gap-2">
          <h1 className="text-section font-bold">{ADMIN_TEXT.operations}</h1>
          <p className="max-w-prose text-ink-2">{ADMIN_TEXT.operationsIntro}</p>
        </div>
        {failure ? (
          <Notice tone="error" title={ADMIN_TEXT.notSaved}>
            <p>{failure}</p>
          </Notice>
        ) : null}
        {saved && !form.formState.isDirty ? <Notice tone="success" title={ADMIN_TEXT.operationsSaved} /> : null}
        <form noValidate onSubmit={form.handleSubmit(submit)} className="grid gap-6">
          <EditorGroup title={ADMIN_TEXT.recipients} hint={ADMIN_TEXT.recipientsHint}>
            <RecipientsField name="enquiriesTo" label={ADMIN_TEXT.enquiriesTo} />
            <RecipientsField name="applicationsTo" label={ADMIN_TEXT.applicationsTo} />
          </EditorGroup>
          <EditorGroup title={ADMIN_TEXT.keeping} hint={ADMIN_TEXT.keepingHint}>
            <DaysField name="retentionDays" label={ADMIN_TEXT.retentionDays} range={RETENTION_DAYS} />
            <DaysField name="cvExpiryDays" label={ADMIN_TEXT.cvExpiryDays} range={CV_EXPIRY_DAYS} />
          </EditorGroup>
          <Button type="submit" pending={saving} disabled={!form.formState.isDirty} className="justify-self-start">
            {saving ? ADMIN_TEXT.savingOperations : ADMIN_TEXT.saveOperations}
          </Button>
        </form>
        <EditorGroup title={ADMIN_TEXT.diskUse} hint={ADMIN_TEXT.diskUseHint}>
          <DiskMeter label={ADMIN_TEXT.mediaFolder} use={view.disk.media} />
          <DiskMeter label={ADMIN_TEXT.cvFolder} use={view.disk.cvs} />
        </EditorGroup>
        <EditorGroup title={ADMIN_TEXT.lastPurge}>
          {last ? (
            <div className="grid gap-1">
              <p>
                {ADMIN_TEXT.purgeRan(dohaDateTime(new Date(last.at)))}{" "}
                {ADMIN_TEXT.purgeDeleted(last.enquiries, last.applications, last.cvs)}
              </p>
              {last.filesNotDeleted > 0 ? (
                <p className="text-error">{ADMIN_TEXT.purgeFilesLeft(last.filesNotDeleted)}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-ink-2">{ADMIN_TEXT.noPurgeYet}</p>
          )}
        </EditorGroup>
      </div>
      <Dialog open={asking !== null} onClose={() => setAsking(null)} title={ADMIN_TEXT.keepingTitle}>
        {asking ? (
          <div className="grid gap-5">
            <p>{ADMIN_TEXT.keepingBody(asking.retentionDays, asking.cvExpiryDays)}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => save(asking)}>{ADMIN_TEXT.change}</Button>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                {ADMIN_TEXT.keepEditing}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </FormProvider>
  );
}

/** Operations (R6.7): read once, then saved at once. */
export function OperationsScreen() {
  const { data, error, isLoading, mutate } = useApiQuery<OperationsViewItem>(ADMIN_API_ROUTES.adminOperations);
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
  return <OperationsForm initial={data} />;
}
