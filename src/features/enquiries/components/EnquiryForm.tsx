"use client";

import Link from "next/link";
import { type ReactNode, useId } from "react";
import type { ZodType } from "zod";

import { BotCheck } from "@/components/ui/bot-check";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/choice";
import { ContactAction } from "@/components/ui/contact-action";
import { Notice } from "@/components/ui/notice";
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
 * What the Quote and Contact forms share (plan §10, §30.3): their fields, the
 * consent to the privacy notice, the trap for bots and Turnstile (§10.3), one
 * send action, and the outcome in place.
 * Sent, the form gives way to the thanks, which takes focus, with WhatsApp as
 * the fastest follow-up (§10.4); not sent, the reason shows above the action
 * and everything typed stays.
 */
export function EnquiryForm({
  schema,
  send,
  action,
  sent,
  notSent,
  whatsapp,
  botCheck,
  children,
}: {
  schema: () => Promise<ZodType>;
  send: (values: Record<string, unknown>) => Promise<unknown>;
  /** The send action's words. */
  action: string;
  /** The thanks once it is sent, and the heading when it was not. */
  sent: string;
  notSent: string;
  /** The company's WhatsApp number, from the published site content. */
  whatsapp: string | null;
  /** Turnstile's site key, and the form's name in Cloudflare's dashboard. */
  botCheck: { siteKey: string; action: string };
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
          <p>{whatsapp ? `${UI_TEXT.sentNext} ${UI_TEXT.fasterOnWhatsApp}` : UI_TEXT.sentNext}</p>
        </Notice>
        {whatsapp ? <ContactAction kind="whatsapp" to={whatsapp} className="justify-self-start" /> : null}
      </div>
    );
  }

  return (
    <form {...form} className="grid gap-6">
      <noscript>
        <Notice tone="info" title={UI_TEXT.formNeedsScript} />
      </noscript>
      {children(errors)}
      <div aria-hidden="true" className="sr-only">
        <label>
          {UI_TEXT.honeypot}
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <Checkbox name="consent" required error={errors.consent}>
        {UI_TEXT.consent}{" "}
        <Link href={ROUTES.privacy} target="_blank" className="font-semibold text-deep underline underline-offset-4">
          {UI_TEXT.privacyNotice}
        </Link>
      </Checkbox>
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
        <Button
          type="submit"
          size="lg"
          pending={status === "sending"}
          className="w-full sm:w-auto sm:justify-self-start"
        >
          {status === "sending" ? UI_TEXT.sending : action}
        </Button>
      </div>
    </form>
  );
}
