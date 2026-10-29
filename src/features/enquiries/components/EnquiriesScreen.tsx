import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { TextInput } from "@/components/ui/text-input";
import { TEXT_LIMITS } from "@/constants/limits";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/routes";
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUSES,
  type EnquiryStatus,
  FORM_KINDS,
  type FormKind,
} from "@/constants/statuses";

import { pageFrom } from "@/lib/pagination";

import type { EnquiryListQuery } from "../types";
import { EnquiryLog } from "./EnquiryLog";

type Param = string | string[] | undefined;

/** One value from the address, when it is one the inbox knows. */
const known = <T extends string>(value: Param, values: readonly T[]): T | undefined =>
  values.find((option) => option === value);

const FORM_LABELS: Record<FormKind, string> = { QUOTE: ADMIN_TEXT.quoteRequests, CONTACT: ADMIN_TEXT.messages };

/** The inbox's address for a choice of filters; a new choice starts on the first page. */
function inboxHref(filters: { status?: EnquiryStatus; form?: FormKind; q?: string }): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.form) params.set("form", filters.form);
  if (filters.q) params.set("q", filters.q);
  const search = params.toString();
  return search ? `${ADMIN_ROUTES.enquiries}?${search}` : ADMIN_ROUTES.enquiries;
}

const TAB =
  "grid min-h-touch place-items-center rounded-control px-4 font-semibold text-ink-2 hover:text-navy aria-[current=page]:bg-mist aria-[current=page]:text-navy";

/**
 * The enquiries inbox (plan §10.5, R4.4): every enquiry, newest first in the
 * day's log, by where it stands and which form sent it, and by a search
 * that works as a plain form. Opened from the alert email's link, its
 * enquiry is open on arrival.
 */
export function EnquiriesScreen({
  searchParams,
  open = null,
}: {
  searchParams: { status?: Param; form?: Param; q?: Param; page?: Param };
  open?: string | null;
}) {
  const status = known(searchParams.status, ENQUIRY_STATUSES);
  const form = known(searchParams.form, FORM_KINDS);
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = pageFrom(searchParams.page);
  const query: EnquiryListQuery = { status, form, q: q || undefined, page };

  return (
    <div className="grid max-w-5xl gap-6">
      <h1 className="text-section font-bold">{ADMIN_TEXT.enquiries}</h1>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <nav aria-label={ADMIN_TEXT.enquiries} className="flex flex-wrap gap-1">
            {[undefined, ...ENQUIRY_STATUSES].map((option) => (
              <Link
                key={option ?? "all"}
                href={inboxHref({ status: option, form, q })}
                aria-current={option === status ? "page" : undefined}
                className={TAB}
              >
                {option ? ENQUIRY_STATUS_LABELS[option] : ADMIN_TEXT.allStatuses}
              </Link>
            ))}
          </nav>
          <nav aria-label={ADMIN_TEXT.allForms} className="flex flex-wrap gap-1">
            {[undefined, ...FORM_KINDS].map((option) => (
              <Link
                key={option ?? "all"}
                href={inboxHref({ status, form: option, q })}
                aria-current={option === form ? "page" : undefined}
                className={TAB}
              >
                {option ? FORM_LABELS[option] : ADMIN_TEXT.allForms}
              </Link>
            ))}
          </nav>
        </div>
        <form
          role="search"
          method="get"
          action={ADMIN_ROUTES.enquiries}
          className="flex w-full items-end gap-2 sm:w-auto"
        >
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {form ? <input type="hidden" name="form" value={form} /> : null}
          <div className="grow sm:w-72">
            <Field label={ADMIN_TEXT.search} hint={ADMIN_TEXT.searchHint} markOptional={false}>
              <TextInput type="search" name="q" defaultValue={q} maxLength={TEXT_LIMITS.line} />
            </Field>
          </div>
          <Button type="submit" variant="secondary">
            {ADMIN_TEXT.find}
          </Button>
        </form>
      </div>
      <EnquiryLog
        key={JSON.stringify(query)}
        query={query}
        pageBase={inboxHref({ status, form, q })}
        initiallyOpen={open}
        empty={
          q
            ? { title: ADMIN_TEXT.nothingFound, body: ADMIN_TEXT.nothingFoundBody }
            : { title: ADMIN_TEXT.everythingEmpty, body: ADMIN_TEXT.everythingEmptyBody }
        }
      />
    </div>
  );
}
