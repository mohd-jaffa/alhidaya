"use client";
"use no memo"; // Rarely redrawn: memoising it would only add to the page's JavaScript budget (plan §31).

import Link from "next/link";
import { type ReactNode, useId } from "react";
import type { ZodType } from "zod";

import { BotCheck } from "@/components/ui/bot-check";
import { Checkbox } from "@/components/ui/choice";
import { ContactAction } from "@/components/ui/contact-action";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import { UI_TEXT } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { type FieldErrors, useSchemaForm } from "@/hooks/useSchemaForm";
import { HONEYPOT_FIELD } from "@/lib/api/honeypot";
import { TURNSTILE_FIELD } from "@/lib/turnstile/endpoints";

/** The thanks takes focus, and comes into view below the sign bar: the form it replaced was taller. */
function takeFocus(node: HTMLDivElement | null) {
  node?.focus({ preventScroll: true });
  node?.scrollIntoView({ block: "start" });
}

/**
 * What the site's forms share (plan §9.2, §10, §30.3): Quote, Contact, the
 * short quote and the application. Their fields, boxed (D132), two to a row
 * on a wide screen when the form asks, the consent to the privacy notice, the
 * trap for bots and Turnstile (§10.3), one send action at the form's end, and
 * the outcome in place.
 * Sent, the form gives way to the thanks, which takes focus, with WhatsApp as
 * the fastest follow-up when the form offers it (§10.4); not sent, the reason
 * shows above the action and everything typed stays.
 */
export function SiteForm({
  schema,
  send,
  action,
  sent,
  sentNext = UI_TEXT.sentNext,
  notSent,
  whatsapp = null,
  botCheck,
  columns = false,
  children,
}: {
  schema: () => Promise<ZodType>;
  send: (values: Record<string, unknown>) => Promise<unknown>;
  /** The send action's words. */
  action: string;
  /** The thanks once it is sent, what happens next, and the heading when it was not. */
  sent: string;
  sentNext?: string;
  notSent: string;
  /** The company's WhatsApp number, from the published site content, when the thanks offers it. */
  whatsapp?: string | null;
  /** Turnstile's site key, and the form's name in Cloudflare's dashboard. */
  botCheck: { siteKey: string; action: string };
  /** Two fields to a row from a small tablet up (a field may span both). */
  columns?: boolean;
  children: (errors: FieldErrors) => ReactNode;
}) {
  const { form, errors, status, failure, answered } = useSchemaForm({ schema, send });
  const sentId = useId();

  if (status === "sent") {
    return (
      <div
        ref={takeFocus}
        role="group"
        tabIndex={-1}
        aria-labelledby={sentId}
        className="grid scroll-mt-[calc(var(--header-height)+4rem)] gap-6 outline-none"
      >
        <Notice tone="success" title={sent} titleId={sentId}>
          <p>{whatsapp ? `${sentNext} ${UI_TEXT.fasterOnWhatsApp}` : sentNext}</p>
        </Notice>
        {whatsapp ? <ContactAction kind="whatsapp" to={whatsapp} arrow className="justify-self-start" /> : null}
      </div>
    );
  }

  return (
    <form {...form} className="grid gap-6">
      <noscript>
        <Notice tone="info" title={UI_TEXT.formNeedsScript} />
      </noscript>
      <>
        {columns ? <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-5">{children(errors)}</div> : children(errors)}
        <div aria-hidden="true" className="sr-only">
          <label>
            {UI_TEXT.honeypot}
            <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
        <Checkbox name="consent" required error={errors.consent}>
          {UI_TEXT.consent}{" "}
          <Link href={ROUTES.privacy} target="_blank" className="font-medium text-deep underline underline-offset-4">
            {UI_TEXT.privacyNotice}
          </Link>
        </Checkbox>
      </>
      {/* The send action; Turnstile's box and a failed send's reason take room before it only when shown. */}
      <div className="grid">
        <BotCheck
          siteKey={botCheck.siteKey}
          action={botCheck.action}
          error={errors[TURNSTILE_FIELD]}
          renewal={answered}
        />
        {failure ? (
          <div className="pb-6">
            <Notice tone="error" title={notSent}>
              <p>
                {failure.message} {UI_TEXT.nothingLost}
              </p>
              {failure.requestId ? (
                <p className="text-small">
                  {UI_TEXT.errorReference}: <span className="tabular-nums">{failure.requestId}</span>
                </p>
              ) : null}
            </Notice>
          </div>
        ) : null}
        <Pill
          type="submit"
          size="lg"
          arrow
          pending={status === "sending"}
          className="w-full sm:w-auto sm:justify-self-end"
        >
          {status === "sending" ? UI_TEXT.sending : action}
        </Pill>
      </div>
    </form>
  );
}
