"use client";

import type { ComponentProps, ReactNode } from "react";

import { ADMIN_TEXT } from "@/constants/admin-messages";

/**
 * Something the admin turns on or off (D134): its words, then a pill whose
 * knob slides to the end when on, deep blue, and a small Enabled or Disabled
 * beside it, so its state never rests on a colour alone. A checkbox under
 * it, read out as a switch.
 */
export function Switch({
  children,
  ...props
}: { children: ReactNode } & Omit<ComponentProps<"input">, "type" | "role">) {
  return (
    <label className="group flex min-h-touch cursor-pointer items-center justify-between gap-4 py-2">
      <span>{children}</span>
      <span className="relative flex shrink-0 items-center gap-2.5">
        <input
          type="checkbox"
          role="switch"
          {...props}
          className="absolute inset-0 m-0 size-full cursor-pointer appearance-none opacity-0"
        />
        <span
          aria-hidden
          className="relative h-7 w-12 rounded-pill bg-ground ring-[1.5px] ring-ink-2 ring-inset transition-colors duration-(--duration-state) group-has-checked:bg-deep group-has-checked:ring-deep group-has-focus-visible:outline-3 group-has-focus-visible:outline-offset-3 group-has-focus-visible:outline-focus"
        >
          <span className="absolute start-1 top-1 size-5 rounded-full bg-ink-2 transition-transform duration-(--duration-state) group-has-checked:translate-x-5 group-has-checked:bg-on-deep rtl:group-has-checked:-translate-x-5" />
        </span>
        <span aria-hidden className="w-16 text-small font-semibold text-ink-2 group-has-checked:hidden">
          {ADMIN_TEXT.disabled}
        </span>
        <span aria-hidden className="hidden w-16 text-small font-semibold text-deep group-has-checked:inline">
          {ADMIN_TEXT.enabled}
        </span>
      </span>
    </label>
  );
}
