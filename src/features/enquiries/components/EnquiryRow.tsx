"use client";

import { useId } from "react";

import { StatusChip, type StatusTone } from "@/components/admin/StatusChip";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ENQUIRY_STATUS_LABELS, type EnquiryStatus } from "@/constants/statuses";
import { dohaTime } from "@/lib/dates";

import type { EnquiryListItem } from "../types";
import { EnquiryOpened } from "./EnquiryOpened";

export const STATUS_TONES: Record<EnquiryStatus, StatusTone> = {
  NEW: "new",
  IN_PROGRESS: "progress",
  RESOLVED: "done",
};

/**
 * One arrival in the day's log (R6.1): its time, who sent what, its line,
 * and where it stands. Pressed, it opens where it is, and everything about
 * it is handled there.
 */
export function EnquiryRow({ item, open, onToggle }: { item: EnquiryListItem; open: boolean; onToggle: () => void }) {
  const panel = useId();
  const title = item.form === "QUOTE" ? ADMIN_TEXT.quoteFrom(item.name) : ADMIN_TEXT.messageFrom(item.name);
  return (
    <article className={open ? "rounded-panel border border-rule bg-mist" : "border-b border-rule"}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? panel : undefined}
          onClick={onToggle}
          className="grid min-h-touch w-full grid-cols-[3.5rem_1fr] items-start gap-x-4 gap-y-2 rounded-panel px-4 py-3.5 text-start hover:bg-mist sm:grid-cols-[3.5rem_1fr_auto]"
        >
          <time dateTime={item.createdAt} className="pt-0.5 text-ink-2 tabular-nums">
            {dohaTime(new Date(item.createdAt))}
          </time>
          <span className="grid min-w-0 gap-0.5">
            <span className="font-semibold">{title}</span>
            {item.summary ? <span className="truncate text-small text-ink-2">{item.summary}</span> : null}
          </span>
          <span className="col-start-2 flex flex-wrap gap-2 sm:col-start-3 sm:justify-end">
            {item.emailStatus === "NOT_SENT" ? <StatusChip tone="error">{ADMIN_TEXT.alertNotSent}</StatusChip> : null}
            <StatusChip tone={STATUS_TONES[item.status]}>{ENQUIRY_STATUS_LABELS[item.status]}</StatusChip>
          </span>
        </button>
      </h3>
      {open ? (
        <div id={panel} className="px-4 pt-2 pb-5 sm:ps-[5.5rem]">
          <EnquiryOpened id={item.id} />
        </div>
      ) : null}
    </article>
  );
}
