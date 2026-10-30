"use client";

import { type ComponentProps, useState } from "react";

import { ADMIN_TEXT } from "@/constants/admin-messages";

import { controlClasses, useFieldControl } from "./field";
import { Pictogram } from "./pictogram";

/**
 * A password inside a `Field`, with a way to see what was typed (from
 * clinicdesk): a mistyped password is the commonest reason a sign-in fails.
 * Shown, the keyboard is told to leave it as typed; nothing here trims or
 * changes it (AGENTS.md §12).
 */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "id" | "type">) {
  const control = useFieldControl();
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input
        {...control}
        {...props}
        type={shown ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={[controlClasses("box"), "pe-14", className].filter(Boolean).join(" ")}
      />
      <button
        type="button"
        aria-pressed={shown}
        aria-label={shown ? ADMIN_TEXT.hidePassword : ADMIN_TEXT.showPassword}
        onClick={() => setShown((visible) => !visible)}
        className="absolute inset-y-0 end-0 grid w-12 place-items-center rounded-e-control text-ink-2 hover:text-navy"
      >
        <Pictogram name={shown ? "eyeOff" : "eye"} size="sm" />
      </button>
    </div>
  );
}
