"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import type { ComponentProps } from "react";

import { controlClasses, useFieldControl } from "./field";

/** A line of text inside a `Field`: a name, a phone number, an email. */
export function TextInput({ className, ...props }: Omit<ComponentProps<"input">, "id">) {
  const control = useFieldControl();
  return <input {...control} {...props} className={[controlClasses(), className].filter(Boolean).join(" ")} />;
}

/** Several lines inside a `Field`: a message. */
export function TextArea({ className, rows = 5, ...props }: Omit<ComponentProps<"textarea">, "id">) {
  const control = useFieldControl();
  return (
    <textarea
      {...control}
      rows={rows}
      {...props}
      className={[controlClasses(), "py-3 leading-relaxed", className].filter(Boolean).join(" ")}
    />
  );
}
