"use client";

import { get, useFormContext, useFormState } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { TextArea, TextInput } from "@/components/ui/text-input";

/**
 * A field's error in the editor (D88), as the page's checks or the server
 * worded it. A list's own error (too few, too many) sits on its `root`.
 */
export function useEditorError(name: string): string | undefined {
  const { errors } = useFormState({ name });
  const error = get(errors, name) as { message?: string; root?: { message?: string } } | undefined;
  return error?.message ?? error?.root?.message;
}

/** Whether anything inside a part of the form is wrong: a section with a field to correct. */
export function useHasErrors(name: string): boolean {
  const { errors } = useFormState({ name });
  return get(errors, name) !== undefined;
}

/** A text field of the editor: on one line or several, bounded as its check is, its error beside it. */
export function EditorText({
  name,
  label,
  max,
  required = false,
  multiline = false,
  rows = 3,
  hint,
  hideLabel = false,
}: {
  name: string;
  label: string;
  max: number;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  hideLabel?: boolean;
}) {
  const { register } = useFormContext();
  const error = useEditorError(name);
  return (
    <Field label={label} hint={hint} required={required} error={error} hideLabel={hideLabel}>
      {multiline ? (
        <TextArea rows={rows} maxLength={max} {...register(name)} />
      ) : (
        <TextInput maxLength={max} {...register(name)} />
      )}
    </Field>
  );
}
