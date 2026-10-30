"use client";

import type { ComponentProps } from "react";

import { controlClasses, useControlLook, useFieldControl } from "./field";
import { Pictogram } from "./pictogram";

/** One choice from a list inside a `Field`: the browser's own select, in the site's look. */
export function Select({ className, children, ...props }: Omit<ComponentProps<"select">, "id">) {
  const control = useFieldControl();
  const look = useControlLook();
  return (
    <div className="relative">
      <select
        {...control}
        {...props}
        className={[controlClasses(look), "appearance-none pe-12", className].filter(Boolean).join(" ")}
      >
        {children}
      </select>
      <Pictogram
        name="chevronDown"
        size="sm"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-navy ${look === "line" ? "end-0" : "end-4"}`}
      />
    </div>
  );
}
