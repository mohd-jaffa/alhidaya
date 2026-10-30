"use client";

import { get, useController, useFormState } from "react-hook-form";

import { useEditorError } from "@/components/admin/editor/EditorText";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";

/** One address of the list, its own error beside it. */
function Address({
  name,
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  name: string;
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { errors } = useFormState({ name: `${name}.${index}` });
  const error = (get(errors, `${name}.${index}`) as { message?: string } | undefined)?.message;
  const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.recipient, index + 1);
  return (
    <li className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <Field label={thing} error={error} required>
          <TextInput
            type="email"
            autoComplete="off"
            maxLength={TEXT_LIMITS.email}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      </div>
      <IconButton
        label={ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, thing)}
        pictogram="close"
        unavailable={!canRemove}
        onClick={onRemove}
      />
    </li>
  );
}

/**
 * Who receives a form's emails (plan §13, Q17): a list of addresses, at
 * least one, at most five, each its own field.
 */
export function RecipientsField({ name, label }: { name: string; label: string }) {
  const { field } = useController({ name });
  const addresses = field.value as string[];
  const error = useEditorError(name);
  const set = (next: string[]) => field.onChange(next);
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 font-semibold">{label}</legend>
      <ol className="grid gap-3">
        {addresses.map((address, index) => (
          <Address
            // The list holds plain addresses; each keeps its place while it is typed.
            key={index}
            name={name}
            index={index}
            value={address}
            onChange={(value) => set(addresses.map((old, at) => (at === index ? value : old)))}
            onRemove={() => set(addresses.filter((_, at) => at !== index))}
            canRemove={addresses.length > 1}
          />
        ))}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {addresses.length < LIST_LIMITS.recipients ? (
        <Button variant="quiet" pictogram="plus" onClick={() => set([...addresses, ""])} className="justify-self-start">
          {ADMIN_TEXT.addRecipient}
        </Button>
      ) : null}
    </fieldset>
  );
}
