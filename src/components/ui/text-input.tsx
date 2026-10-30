"use client";

import type { ComponentProps } from "react";

import { controlClasses, useControlLook, useFieldControl } from "./field";

/** A line of text inside a `Field`: a name, a phone number, an email. */
export function TextInput({ className, ...props }: Omit<ComponentProps<"input">, "id">) {
  const control = useFieldControl();
  const look = useControlLook();
  return <input {...control} {...props} className={[controlClasses(look), className].filter(Boolean).join(" ")} />;
}

/** Several lines inside a `Field`: a message. */
export function TextArea({ className, rows = 5, ...props }: Omit<ComponentProps<"textarea">, "id">) {
  const control = useFieldControl();
  const look = useControlLook();
  return (
    <textarea
      {...control}
      rows={rows}
      {...props}
      className={[controlClasses(look), "py-3 leading-relaxed", className].filter(Boolean).join(" ")}
    />
  );
}
