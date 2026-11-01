"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import { useEffect, useRef, useState } from "react";

import { UI_TEXT } from "@/constants/messages";
import { TURNSTILE_FIELD, TURNSTILE_SCRIPT } from "@/lib/turnstile/endpoints";

import { FieldError } from "./field";

/** The part of Cloudflare's widget the site uses. */
interface Turnstile {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loading: Promise<Turnstile> | null = null;

/** Cloudflare's script, added once for the whole visit; a failed load may be tried again. */
function loadTurnstile(): Promise<Turnstile> {
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile is missing")));
    script.onerror = () => {
      script.remove();
      reject(new Error("Turnstile did not load"));
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
}

/**
 * Cloudflare Turnstile in a public form (plan §10.3, D78): loaded when the
 * visitor first reaches into the form, never in the page's first load; seen
 * only if Cloudflare needs the visitor to tick a box, and taking no room
 * otherwise. Its token goes into the form as `turnstileToken`. A token works once, so each send the server
 * answered (`renewal`) asks for a fresh one.
 */
export function BotCheck({
  siteKey,
  action,
  error,
  renewal,
}: {
  siteKey: string;
  /** What the form is, as Cloudflare's dashboard shows it: "quote", "contact". */
  action: string;
  error?: string;
  renewal: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  /** Whether Cloudflare is showing its box: only then, or with a message, does the check take room. */
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const container = box.current;
    const form = container?.closest("form");
    if (!container || !form) return;
    let gone = false;
    const start = () => {
      loadTurnstile().then(
        (turnstile) => {
          if (gone) return;
          widget.current = turnstile.render(container, {
            sitekey: siteKey,
            action,
            theme: "light",
            appearance: "interaction-only",
            size: "flexible",
            "response-field-name": TURNSTILE_FIELD,
            callback: () => setUnavailable(false),
            "error-callback": () => setUnavailable(true),
            "before-interactive-callback": () => setAsking(true),
            "after-interactive-callback": () => setAsking(false),
          });
        },
        () => {
          if (!gone) setUnavailable(true);
        },
      );
    };
    form.addEventListener("focusin", start, { once: true });
    return () => {
      gone = true;
      form.removeEventListener("focusin", start);
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (renewal > 0 && widget.current) window.turnstile?.reset(widget.current);
  }, [renewal]);

  const message = unavailable ? UI_TEXT.botCheckUnavailable : error;
  return (
    <div className={asking || message ? "grid gap-2 pb-6" : "grid"} aria-live="polite">
      <div ref={box} />
      {message ? <FieldError>{message}</FieldError> : null}
    </div>
  );
}
