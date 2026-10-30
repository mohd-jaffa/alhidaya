"use client";

import { type ComponentProps, type ReactNode, useId } from "react";

import { UI_TEXT } from "@/constants/messages";

import { type ControlLook, FieldError, useControlLook } from "./field";

/** A box or a round to tick, filled when ticked: deep blue in the admin, forest on the site's forms (D97). */
const mark = (look: ControlLook) =>
  `mt-0.5 size-6 shrink-0 appearance-none border-2 border-ink-2 bg-ground bg-center bg-no-repeat aria-invalid:border-error data-invalid:border-error ${
    look === "line" ? "checked:border-forest checked:bg-forest" : "checked:border-deep checked:bg-deep"
  }`;

/** A check mark drawn in the ground colour, for a ticked box. */
const TICK =
  "checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7'/%3E%3C/svg%3E\")]";

/** A vocabulary's answers as a `RadioGroup` offers them: each value with its label, in the vocabulary's order. */
export const choiceOptions = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

/**
 * One answer of several (plan §9.2, §10.1): a fieldset with its question as
 * the legend, each answer a tall, tappable row. The error is tied to the
 * group.
 */
export function RadioGroup({
  legend,
  name,
  options,
  error,
  required = false,
  ...props
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  required?: boolean;
} & Omit<ComponentProps<"input">, "type" | "id" | "value">) {
  const id = useId();
  const look = useControlLook();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <fieldset aria-describedby={errorId} className="grid gap-2">
      <legend className="mb-2 font-semibold">
        {legend}
        {required ? null : (
          <>
            {" "}
            <span className="font-normal text-ink-2">({UI_TEXT.optional})</span>
          </>
        )}
      </legend>
      {options.map((option) => (
        <label key={option.value} className="flex min-h-touch cursor-pointer items-start gap-3 py-2">
          <input
            type="radio"
            name={name}
            value={option.value}
            required={required}
            data-invalid={error ? "" : undefined}
            {...props}
            className={`${mark(look)} rounded-full checked:shadow-[inset_0_0_0_4px_var(--color-ground)]`}
          />
          <span>{option.label}</span>
        </label>
      ))}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}

/** A box to tick, its words beside it: the consent to the privacy notice (plan §9.2). */
export function Checkbox({
  children,
  error,
  ...props
}: { children: ReactNode; error?: string } & Omit<ComponentProps<"input">, "type" | "id">) {
  const id = useId();
  const look = useControlLook();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex min-h-touch cursor-pointer items-start gap-3 py-2">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...props}
          className={`${mark(look)} ${TICK} rounded-tag`}
        />
        <span>{children}</span>
      </label>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
