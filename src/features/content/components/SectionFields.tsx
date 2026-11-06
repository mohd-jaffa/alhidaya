"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { EditorText, useEditorError } from "@/components/admin/editor/EditorText";
import { ItemControls } from "@/components/admin/editor/ItemControls";
import { PhotoField } from "@/components/admin/editor/PhotoField";
import { RichTextField } from "@/components/admin/editor/RichTextField";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Pictogram } from "@/components/ui/pictogram";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { type PageKey, SECTION_PICTOGRAMS, type SectionType } from "@/constants/sections";
import { SECTION_FORMS } from "@/constants/statuses";

import { blankItem, type SectionField, sectionFields } from "../editor";
import { ValuesField } from "./ValuesField";

function ToggleField({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext();
  return <Switch {...register(name)}>{label}</Switch>;
}

/** Which form a form section shows (plan §7.2, D130): the Quote's, the Contact's, or the short quote. */
function FormChoice({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext();
  return (
    <Field label={label} required>
      <Select {...register(name)}>
        {SECTION_FORMS.map((kind) => (
          <option key={kind} value={kind}>
            {ADMIN_TEXT.formNames[kind]}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** The icon beside some words (D97), picked from the set by name, or none. */
function PictogramChoice({ name, label }: { name: string; label: string }) {
  const { register } = useFormContext();
  return (
    <Field label={label}>
      <Select {...register(name, { setValueAs: (value: string | null) => value || null })}>
        <option value="">{ADMIN_TEXT.noIcon}</option>
        {SECTION_PICTOGRAMS.map((pictogram) => (
          <option key={pictogram} value={pictogram}>
            {ADMIN_TEXT.pictogramNames[pictogram]}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** A list of items, each holding its own fields: Home's slides, About's points. */
function ListField({
  page,
  name,
  field,
}: {
  page: PageKey;
  name: string;
  field: Extract<SectionField, { kind: "list" }>;
}) {
  const { fields, append, move, remove } = useFieldArray({ name, keyName: "key" });
  const error = useEditorError(name);
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 font-semibold">{field.label}</legend>
      <ol className="grid gap-3">
        {fields.map((item, index) => {
          const thing = ADMIN_TEXT.numbered(field.item, index + 1);
          return (
            <li key={item.key} className="grid gap-4 rounded-control border border-rule bg-ground p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-bold text-ink-2">{thing}</p>
                <ItemControls
                  thing={thing}
                  index={index}
                  count={fields.length}
                  canRemove={fields.length > field.min}
                  onMove={(to) => move(index, to)}
                  onRemove={() => remove(index)}
                />
              </div>
              <Fields page={page} base={`${name}.${index}`} fields={field.fields} />
            </li>
          );
        })}
      </ol>
      {error ? <FieldError>{error}</FieldError> : null}
      {fields.length < field.max ? (
        <Button
          variant="quiet"
          pictogram="plus"
          onClick={() => append(blankItem(page, field.fields))}
          className="justify-self-start"
        >
          {field.add}
        </Button>
      ) : null}
    </fieldset>
  );
}

/** Fields at `base`, each named from it. */
function Fields({ page, base, fields }: { page: PageKey; base: string; fields: readonly SectionField[] }) {
  return fields.map((field) => {
    const name = `${base}.${field.name}`;
    switch (field.kind) {
      case "toggle":
        return <ToggleField key={name} name={name} label={field.label} />;
      case "line":
      case "lines":
        return (
          <EditorText
            key={name}
            name={`${name}.en`}
            label={field.label}
            max={field.max}
            required={field.required}
            multiline={field.kind === "lines"}
            hint={field.hint}
          />
        );
      case "photo":
        return <PhotoField key={name} name={name} label={field.label} />;
      case "rich":
        return <RichTextField key={name} name={name} label={field.label} />;
      case "values":
        return <ValuesField key={name} name={name} label={field.label} />;
      case "form":
        return <FormChoice key={name} name={name} label={field.label} />;
      case "pictogram":
        return <PictogramChoice key={name} name={name} label={field.label} />;
      case "group":
        return (
          <fieldset key={name} className="grid gap-4 rounded-control border border-rule p-4">
            <legend className="px-1 font-semibold">{field.label}</legend>
            <Fields page={page} base={name} fields={field.fields} />
          </fieldset>
        );
      case "list":
        return <ListField key={name} page={page} name={name} field={field} />;
    }
  });
}

/**
 * A section opened in its row (D88): its type's fields in order (Home's sign
 * as its slides, D128), and what it shows on its own besides them
 * (the services, the jobs, the contact details), so the admin knows where
 * those are changed.
 */
export function SectionFields({ page, index, type }: { page: PageKey; index: number; type: SectionType }) {
  const shows = ADMIN_TEXT.sectionShows[type];
  return (
    <div className="grid gap-5">
      {shows ? (
        <p className="flex items-start gap-2 text-ink-2">
          <Pictogram name="info" size="sm" className="mt-0.5 text-deep" />
          <span>{shows}</span>
        </p>
      ) : null}
      <Fields page={page} base={`sections.${index}.content`} fields={sectionFields(page, type)} />
    </div>
  );
}
