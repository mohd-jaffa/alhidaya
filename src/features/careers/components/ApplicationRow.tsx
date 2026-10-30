"use client";

import { useId } from "react";

import { StatusChip, type StatusTone } from "@/components/admin/StatusChip";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from "@/constants/statuses";
import { dohaTime } from "@/lib/dates";

import type { ApplicationListItem } from "../types";
import { ApplicationOpened } from "./ApplicationOpened";

export const APPLICATION_TONES: Record<ApplicationStatus, StatusTone> = {
  NEW: "new",
  IN_REVIEW: "progress",
  SHORTLISTED: "progress",
  CLOSED: "done",
};

/** What went wrong with an application, as chips: its HR email not sent, its CV not stored. */
export function ApplicationFailures({ item }: { item: Pick<ApplicationListItem, "emailStatus" | "cvStatus"> }) {
  return (
    <>
      {item.emailStatus === "NOT_SENT" ? <StatusChip tone="error">{ADMIN_TEXT.hrEmailNotSent}</StatusChip> : null}
      {item.cvStatus === "NOT_STORED" ? <StatusChip tone="error">{ADMIN_TEXT.cvNotStored}</StatusChip> : null}
    </>
  );
}

/**
 * One application in the day's log (R6.1, plan §9.5): its time, who applied
 * and for which job, what went wrong if anything, and where it stands.
 * Pressed, it opens where it is, and everything about it is handled there.
 */
export function ApplicationRow({
  item,
  open,
  onToggle,
}: {
  item: ApplicationListItem;
  open: boolean;
  onToggle: () => void;
}) {
  const panel = useId();
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
            <span className="font-semibold">{ADMIN_TEXT.applicationFrom(item.name)}</span>
            <span className="truncate text-small text-ink-2">{item.jobTitle ?? ADMIN_TEXT.generalApplication}</span>
          </span>
          <span className="col-start-2 flex flex-wrap gap-2 sm:col-start-3 sm:justify-end">
            <ApplicationFailures item={item} />
            <StatusChip tone={APPLICATION_TONES[item.status]}>{APPLICATION_STATUS_LABELS[item.status]}</StatusChip>
          </span>
        </button>
      </h3>
      {open ? (
        <div id={panel} className="px-4 pt-2 pb-5 sm:ps-[5.5rem]">
          <ApplicationOpened id={item.id} />
        </div>
      ) : null}
    </article>
  );
}
