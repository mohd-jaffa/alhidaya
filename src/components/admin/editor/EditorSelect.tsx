"use client";

import { useFormContext } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

import { useEditorError } from "./EditorText";

/** One choice from a fixed list (plan §8, §9.1): a service's line, a job's terms. */
export function EditorSelect({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly (readonly [value: string, label: string])[];
}) {
  const { register } = useFormContext();
  const error = useEditorError(name);
  return (
    <Field label={label} error={error} required>
      <Select {...register(name)}>
        {options.map(([value, words]) => (
          <option key={value} value={value}>
            {words}
          </option>
        ))}
      </Select>
    </Field>
  );
}
