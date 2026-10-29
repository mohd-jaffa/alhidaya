"use client";

import { createContext, type ReactNode, use, useId } from "react";

import { UI_TEXT } from "@/constants/messages";

import { Pictogram } from "./pictogram";

interface FieldControl {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
}

const FieldContext = createContext<FieldControl | null>(null);

/** What a control inside a `Field` takes: its id, what describes it, whether it is wrong. */
export function useFieldControl(): FieldControl {
  const control = use(FieldContext);
  if (!control) throw new Error("A form control is used outside a Field.");
  return control;
}

/** The error beside a field (plan §30.3): words, the error icon and the error red (D63). */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-2 text-small font-medium text-error">
      <Pictogram name="error" size="sm" className="mt-px" />
      <span>{children}</span>
    </p>
  );
}

/**
 * A labelled form field (plan §30.3): the label above, a hint under it, the
 * error beside the control. A required control says so itself (the browser
 * announces it); an optional one says "(optional)" for everyone to see. The control inside reads its id and description
 * from the field, so a screen reader hears the label, the hint and the error.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  markOptional = true,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Whether a field that may be left empty says so; a search box need not. */
  markOptional?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control: FieldControl = { id, "aria-describedby": describedBy, required };
  if (error) control["aria-invalid"] = true;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-semibold">
        {label}
        {required || !markOptional ? null : (
          <>
            {" "}
            <span className="font-normal text-ink-2">({UI_TEXT.optional})</span>
          </>
        )}
      </label>
      {hint ? (
        <p id={hintId} className="text-small text-ink-2">
          {hint}
        </p>
      ) : null}
      <FieldContext value={control}>{children}</FieldContext>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

/** The look every text-like control shares: 16 px and up, a 48 px target, a firm border. */
export const CONTROL_CLASSES =
  "w-full min-h-12 rounded-control border-[1.5px] border-ink-2 bg-ground px-4 text-body text-navy placeholder:text-ink-2 aria-invalid:border-2 aria-invalid:border-error";
