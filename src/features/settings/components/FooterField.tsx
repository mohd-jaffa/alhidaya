"use client";

import { useFieldArray } from "react-hook-form";

import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";

import { LinkTarget } from "./LinkTarget";

/** One footer column's links: each its words and where it goes. */
function ColumnLinks({ name }: { name: string }) {
  const { fields, append, move, remove } = useFieldArray({ name, keyName: "key" });
  const error = useEditorError(name);
  return (
    <div className="grid gap-3">
      <ol className="grid gap-3 empty:hidden">
        {fields.map((field, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.footerLink, index + 1);
          return (
            <li key={field.key} className="grid gap-3 border-t border-rule pt-3">
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
                  name={`${name}.${index}.label.en`}
                  label={ADMIN_TEXT.linkText}
                  max={TEXT_LIMITS.label}
                  required
                />
                <LinkTarget name={`${name}.${index}.href`} />
              </div>
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < LIST_LIMITS.footerLinks ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append({ label: { en: "" }, href: "" })}
          className="justify-self-start"
        >
          {ADMIN_TEXT.addLink}
        </Button>
      ) : null}
    </div>
  );
}

/** The footer's columns (plan §13, D94): each a heading and its links, moved, removed and added one at a time. */
export function FooterField() {
  const { fields, append, move, remove } = useFieldArray({ name: "footer", keyName: "key" });
  const error = useEditorError("footer");
  return (
    <div className="grid gap-3">
      <ol className="grid gap-3 empty:hidden">
        {fields.map((field, index) => {
          const thing = ADMIN_TEXT.numbered(ADMIN_TEXT.footerColumn, index + 1);
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
              <EditorText
                name={`footer.${index}.heading.en`}
                label={ADMIN_TEXT.columnHeading}
                max={TEXT_LIMITS.label}
                required
              />
              <ColumnLinks name={`footer.${index}.links`} />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < LIST_LIMITS.footerColumns ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append({ heading: { en: "" }, links: [] })}
          className="justify-self-start"
        >
          {ADMIN_TEXT.addColumn}
        </Button>
      ) : null}
    </div>
  );
}
