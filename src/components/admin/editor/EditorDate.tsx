"use client";

import { useFormContext } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { TextInput } from "@/components/ui/text-input";

import { useEditorError } from "./EditorText";

/** A calendar day, in the browser's own date field (plan §9.1); one that may be empty is stored as none. */
export function EditorDate({
  name,
  label,
  hint,
  required = false,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  const { register } = useFormContext();
  const error = useEditorError(name);
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      <TextInput
        type="date"
        className="sm:max-w-60"
        {...register(name, { setValueAs: (value: string | null) => (value === "" && !required ? null : value) })}
      />
    </Field>
  );
}
