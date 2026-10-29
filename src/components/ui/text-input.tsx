"use client";

import type { ComponentProps } from "react";

import { CONTROL_CLASSES, useFieldControl } from "./field";

/** A line of text inside a `Field`: a name, a phone number, an email. */
export function TextInput({ className, ...props }: Omit<ComponentProps<"input">, "id">) {
  const control = useFieldControl();
  return <input {...control} {...props} className={[CONTROL_CLASSES, className].filter(Boolean).join(" ")} />;
}

/** Several lines inside a `Field`: a message. */
export function TextArea({ className, rows = 5, ...props }: Omit<ComponentProps<"textarea">, "id">) {
  const control = useFieldControl();
  return (
    <textarea
      {...control}
      rows={rows}
      {...props}
      className={[CONTROL_CLASSES, "py-3 leading-relaxed", className].filter(Boolean).join(" ")}
    />
  );
}
