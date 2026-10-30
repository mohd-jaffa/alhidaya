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

/**
 * How the controls of a form look (D97): boxed in the admin; on the site's
 * forms, a line under each on the form's panel, as the reference draws them.
 */
export type ControlLook = "box" | "line";

const LookContext = createContext<ControlLook>("box");

/** Sets the look of every control inside it. */
export function ControlsLook({ look, children }: { look: ControlLook; children: ReactNode }) {
  return <LookContext value={look}>{children}</LookContext>;
}

/** The look of the controls around: boxed, unless their form says otherwise. */
export const useControlLook = (): ControlLook => use(LookContext);

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
  hideLabel = false,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Whether a field that may be left empty says so; a search box need not. */
  markOptional?: boolean;
  /** For a control whose label is already in view beside it (an editor's numbered block): kept for screen readers. */
  hideLabel?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control: FieldControl = { id, "aria-describedby": describedBy, required };
  if (error) control["aria-invalid"] = true;
  const look = useControlLook();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={hideLabel ? "sr-only" : look === "line" ? "font-medium" : "font-semibold"}>
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

const CONTROL_LOOKS: Record<ControlLook, string> = {
  box: "rounded-control border-[1.5px] bg-ground px-4 aria-invalid:border-2",
  line: "border-b-[1.5px] bg-transparent aria-invalid:border-b-2",
};

/** The look every text-like control shares: 16 px and up, a 48 px target, a firm edge, boxed or a line under it. */
export const controlClasses = (look: ControlLook) =>
  `w-full min-h-12 border-ink-2 text-body text-navy placeholder:text-ink-2 aria-invalid:border-error ${CONTROL_LOOKS[look]}`;
