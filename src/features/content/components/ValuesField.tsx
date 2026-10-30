"use client";

import { useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";

import { EditorText, useEditorError } from "./EditorText";
import { ItemControls } from "./ItemControls";

/** The values a section lists (plan §7.2): one to six, each a title and an optional line. */
export function ValuesField({ name, label }: { name: string; label: string }) {
  const { fields, append, move, remove } = useFieldArray({ name, keyName: "key" });
  const error = useEditorError(name);
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 font-semibold">{label}</legend>
      <ol className="grid gap-3">
        {fields.map((field, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.value, index + 1);
          return (
            <li key={field.key} className="grid gap-3 rounded-control border border-rule bg-ground p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-bold text-ink-2">{thing}</p>
                <ItemControls
                  thing={thing}
                  index={index}
                  count={fields.length}
                  canRemove={fields.length > 1}
                  onMove={(to) => move(index, to)}
                  onRemove={() => remove(index)}
                />
              </div>
              <EditorText
                name={`${name}.${index}.title.en`}
                label={ADMIN_TEXT.valueTitle}
                max={TEXT_LIMITS.valueTitle}
                required
              />
              <EditorText
                name={`${name}.${index}.text.en`}
                label={ADMIN_TEXT.text}
                max={TEXT_LIMITS.lede}
                multiline
                rows={2}
              />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < LIST_LIMITS.values ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append({ title: { en: "" }, text: { en: "" } })}
          className="justify-self-start"
        >
          {ADMIN_TEXT.addValue}
        </Button>
      ) : null}
    </fieldset>
  );
}
