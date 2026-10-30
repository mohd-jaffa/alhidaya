"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";

import { LinkTarget } from "./LinkTarget";

/**
 * The header menu (plan §13, D94): its links in order, each with its words,
 * where it goes and whether it shows; moved, removed and added one at a time.
 */
export function NavigationField() {
  const { register } = useFormContext();
  const { fields, append, move, remove } = useFieldArray({ name: "navigation", keyName: "key" });
  const error = useEditorError("navigation");
  return (
    <div className="grid gap-3">
      <ol className="grid gap-3 empty:hidden">
        {fields.map((field, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.menuLink, index + 1);
          return (
            <li key={field.key} className="grid gap-3 rounded-control border border-rule bg-ground p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-bold text-ink-2">{thing}</p>
                <ItemControls
                  thing={thing}
                  index={index}
                  count={fields.length}
                  onMove={(to) => move(index, to)}
                  onRemove={() => remove(index)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                <EditorText
                  name={`navigation.${index}.label.en`}
                  label={ADMIN_TEXT.linkText}
                  max={TEXT_LIMITS.label}
                  required
                />
                <LinkTarget name={`navigation.${index}.href`} />
              </div>
              <Checkbox {...register(`navigation.${index}.visible`)}>{ADMIN_TEXT.shownInMenu}</Checkbox>
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < LIST_LIMITS.navigation ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append({ label: { en: "" }, href: "", visible: true })}
          className="justify-self-start"
        >
          {ADMIN_TEXT.addLink}
        </Button>
      ) : null}
    </div>
  );
}
