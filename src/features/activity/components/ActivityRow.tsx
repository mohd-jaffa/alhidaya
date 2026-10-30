import Link from "next/link";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { PAGE_NAMES } from "@/constants/messages";
import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
  ENQUIRY_STATUS_LABELS,
  type EnquiryStatus,
} from "@/constants/statuses";
import { dohaTime } from "@/lib/dates";

import type { ActivitySubject } from "../api";
import type { ActivityItem } from "../types";

const RECORD_ROUTES = { SERVICES: ADMIN_ROUTES.service, JOBS: ADMIN_ROUTES.job, CLIENTS: ADMIN_ROUTES.client };
const ORDER_ROUTES = { SERVICES: ADMIN_ROUTES.services, CLIENTS: ADMIN_ROUTES.clients };
const fields = new Intl.ListFormat("en-GB", { type: "conjunction" });

/** What a change was made to, as the line names it. */
function thingOf(subject: ActivitySubject): string {
  switch (subject.type) {
    case "page":
      return ADMIN_TEXT.thePage(PAGE_NAMES[subject.page]);
    case "order":
      return ADMIN_TEXT.theOrder[subject.collection];
    case "settings":
      return ADMIN_TEXT.theSettings;
    case "operations":
      return ADMIN_TEXT.operations;
    case "record":
      return subject.name
        ? ADMIN_TEXT.theRecord[subject.collection](subject.name)
        : ADMIN_TEXT.aRecord[subject.collection];
    case "media":
      if (subject.kind === "PDF") return ADMIN_TEXT.aBrochure;
      return subject.name ? ADMIN_TEXT.theImage(subject.name) : ADMIN_TEXT.anImage;
    case "enquiry":
      return ADMIN_TEXT.anEnquiry;
    case "application":
      return ADMIN_TEXT.anApplication;
    default:
      return "";
  }
}

/** Where what a change was made to opens in the admin, while it is still there. */
function hrefOf(subject: ActivitySubject): string | null {
  switch (subject.type) {
    case "page":
      return ADMIN_ROUTES.page(subject.page);
    case "order":
      return ORDER_ROUTES[subject.collection];
    case "settings":
      return ADMIN_ROUTES.settings;
    case "operations":
      return ADMIN_ROUTES.operations;
    case "record":
      return RECORD_ROUTES[subject.collection](subject.id);
    case "media":
      return subject.kind === null ? null : subject.kind === "PDF" ? ADMIN_ROUTES.settings : ADMIN_ROUTES.media;
    case "enquiry":
      return subject.exists ? ADMIN_ROUTES.enquiry(subject.id) : null;
    case "application":
      return subject.exists ? ADMIN_ROUTES.application(subject.id) : null;
    default:
      return null;
  }
}

/** Where an enquiry or an application was moved, by its label. */
const statusOf = (subject: ActivitySubject, to: string) =>
  subject.type === "enquiry"
    ? ENQUIRY_STATUS_LABELS[to as EnquiryStatus]
    : APPLICATION_STATUS_LABELS[to as ApplicationStatus];

/** The line a change reads as (D96): what was done, to what, never with a person's details. */
function describeActivity(item: ActivityItem): string {
  const thing = thingOf(item.subject);
  switch (item.action) {
    case "SIGN_IN":
      return ADMIN_TEXT.didSignIn;
    case "SIGN_OUT":
      return ADMIN_TEXT.didSignOut;
    case "PASSWORD_RESET_REQUESTED":
      return ADMIN_TEXT.didAskReset;
    case "PASSWORD_CHANGED":
      // From the profile, by the admin themselves (D115); else from a reset link.
      return item.who ? ADMIN_TEXT.didChangePassword : ADMIN_TEXT.didSetPassword;
    case "RETENTION_PURGE": {
      const { enquiries, applications, cvs } = item.counts!;
      return ADMIN_TEXT.didPurge(ADMIN_TEXT.purgeDeleted(enquiries, applications, cvs));
    }
    case "SETTINGS_CHANGE": {
      const changed = item.changed.map(
        (field) => ADMIN_TEXT.operationsFields[field as keyof typeof ADMIN_TEXT.operationsFields] ?? field,
      );
      return changed.length > 0 ? ADMIN_TEXT.didChangeOperations(fields.format(changed)) : ADMIN_TEXT.didSaveOperations;
    }
    case "CREATE":
      return item.subject.type === "media" ? ADMIN_TEXT.didUpload(thing) : ADMIN_TEXT.didCreate(thing);
    case "UPDATE":
      if (item.subject.type === "account") return ADMIN_TEXT.didRename;
      if (item.changed.includes("archived")) return ADMIN_TEXT.didRestore(thing);
      if (item.changed.includes("emailStatus")) {
        return item.to === "SENT" ? ADMIN_TEXT.didSendAgain(thing) : ADMIN_TEXT.didNotSendAgain(thing);
      }
      return item.subject.type === "media" ? ADMIN_TEXT.didEditWords(thing) : ADMIN_TEXT.didSave(thing);
    case "PUBLISH":
      return ADMIN_TEXT.didPublish(thing);
    case "DISCARD_DRAFT":
      return ADMIN_TEXT.didDiscard(thing);
    case "REORDER":
      return ADMIN_TEXT.didReorder(thing);
    case "ARCHIVE":
      return ADMIN_TEXT.didArchive(thing);
    case "STATUS_CHANGE":
      if (item.subject.type === "record") return item.to ? ADMIN_TEXT.didClose(thing) : ADMIN_TEXT.didReopen(thing);
      return ADMIN_TEXT.didMove(thing, statusOf(item.subject, String(item.to)));
    case "NOTE_ADD":
      return ADMIN_TEXT.didAddNote(thing);
    case "CV_DOWNLOAD":
      return ADMIN_TEXT.didDownloadCv(thing);
    case "DELETE":
      return ADMIN_TEXT.didDelete(thing);
  }
}

/** What a change with no admin to it came from: the site's own work, the sign-in page, or an account since removed. */
const NO_ADMIN: Partial<Record<ActivityItem["action"], string>> = {
  RETENTION_PURGE: ADMIN_TEXT.theWebsite,
  PASSWORD_RESET_REQUESTED: ADMIN_TEXT.fromSignInPage,
  PASSWORD_CHANGED: ADMIN_TEXT.fromSignInPage,
};

/** Who made a change: the admin by name, or where it came from when no admin made it or theirs is gone. */
const whoOf = (item: ActivityItem) => item.who ?? NO_ADMIN[item.action] ?? ADMIN_TEXT.formerAdmin;

/**
 * One change in Activity's log (D96): its time, what was done (opening what
 * it was done to, while that is still there) and who did it.
 */
export function ActivityRow({ item }: { item: ActivityItem }) {
  const what = describeActivity(item);
  const href = hrefOf(item.subject);
  return (
    <article className="grid grid-cols-[3.5rem_1fr] items-start gap-x-4 border-b border-rule px-4 py-3.5">
      <time dateTime={item.createdAt} className="pt-0.5 text-ink-2 tabular-nums">
        {dohaTime(new Date(item.createdAt))}
      </time>
      <div className="grid min-w-0 gap-0.5">
        <h3 className="font-semibold">
          {href ? (
            <Link href={href} className="text-deep underline-offset-4 hover:underline">
              {what}
            </Link>
          ) : (
            what
          )}
        </h3>
        <p className="text-small text-ink-2">{whoOf(item)}</p>
      </div>
    </article>
  );
}
