"use client";

import type { ComponentProps } from "react";

import { CONTROL_CLASSES, useFieldControl } from "./field";
import { Pictogram } from "./pictogram";

/** One choice from a list inside a `Field`: the browser's own select, in the site's look. */
export function Select({ className, children, ...props }: Omit<ComponentProps<"select">, "id">) {
  const control = useFieldControl();
  return (
    <div className="relative">
      <select
        {...control}
        {...props}
        className={[CONTROL_CLASSES, "appearance-none pe-12", className].filter(Boolean).join(" ")}
      >
        {children}
      </select>
      <Pictogram
        name="chevronDown"
        size="sm"
        className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-navy"
      />
    </div>
  );
}
