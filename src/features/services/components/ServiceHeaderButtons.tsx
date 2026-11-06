"use client";

import { useFieldArray } from "react-hook-form";

import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";

/** Content controls only: optional labels/links, in their fixed primary/secondary order (D146). */
export function ServiceHeaderButtons() {
  const { fields, append, move, remove } = useFieldArray({ name: "headerButtons", keyName: "key" });
  const error = useEditorError("headerButtons");
  return (
    <div className="grid gap-5">
      {fields.map((field, index) => {
        const title = `${ADMIN_TEXT.serviceButton} ${index + 1}`;
        return (
          <fieldset key={field.key} className="grid gap-4">
            <legend className="sr-only">{title}</legend>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{title}</p>
              <ItemControls
                thing={title}
                index={index}
                count={fields.length}
                onMove={(to) => move(index, to)}
                onRemove={() => remove(index)}
              />
            </div>
            <EditorText
              name={`headerButtons.${index}.label.en`}
              label={ADMIN_TEXT.buttonLabel}
              max={TEXT_LIMITS.label}
              required
            />
            <EditorText
              name={`headerButtons.${index}.href`}
              label={ADMIN_TEXT.buttonLink}
              max={TEXT_LIMITS.url}
              hint={ADMIN_TEXT.serviceButtonLinkHint}
              required
            />
          </fieldset>
        );
      })}
      {error ? <FieldError>{error}</FieldError> : null}
      <Button
        type="button"
        variant="secondary"
        disabled={fields.length >= LIST_LIMITS.serviceButtons}
        onClick={() => append({ label: { en: "" }, href: "" })}
      >
        {ADMIN_TEXT.addServiceButton}
      </Button>
    </div>
  );
}
