import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { ActivityRow } from "@/features/activity/components/ActivityRow";
import type { ActivityItem } from "@/features/activity/types";
import { dohaTime } from "@/lib/dates";

const AT = "2026-10-30T09:05:00.000Z";
const item = (entry: Partial<ActivityItem>): ActivityItem => ({
  id: "audit-1",
  createdAt: AT,
  who: "Fatima",
  action: "SIGN_IN",
  subject: { type: "account" },
  changed: [],
  to: null,
  counts: null,
  ...entry,
});

const service = { type: "record", collection: "SERVICES", id: "s1", name: "Elderly care" } as const;
const job = { type: "record", collection: "JOBS", id: "j1", name: "Registered nurse" } as const;
const enquiry = { type: "enquiry", id: "e1", exists: true } as const;
const application = { type: "application", id: "a1", exists: true } as const;
const image = { type: "media", kind: "IMAGE", name: "A nurse at a bedside" } as const;

const CASES: [string, Partial<ActivityItem>, string, string | null][] = [
  ["a sign-in", {}, ADMIN_TEXT.didSignIn, null],
  ["a sign-out", { action: "SIGN_OUT" }, ADMIN_TEXT.didSignOut, null],
  ["a reset asked for", { action: "PASSWORD_RESET_REQUESTED", who: null }, ADMIN_TEXT.didAskReset, null],
  ["a password set", { action: "PASSWORD_CHANGED", who: null }, ADMIN_TEXT.didSetPassword, null],
  [
    "the nightly clean-up",
    {
      action: "RETENTION_PURGE",
      who: null,
      subject: { type: "operations" },
      counts: { enquiries: 2, applications: 1, cvs: 3 },
    },
    ADMIN_TEXT.didPurge(ADMIN_TEXT.purgeDeleted(2, 1, 3)),
    ADMIN_ROUTES.operations,
  ],
  [
    "the keeping periods changed",
    { action: "SETTINGS_CHANGE", subject: { type: "operations" }, changed: ["retentionDays", "cvExpiryDays"] },
    ADMIN_TEXT.didChangeOperations(
      `${ADMIN_TEXT.operationsFields.retentionDays} and ${ADMIN_TEXT.operationsFields.cvExpiryDays}`,
    ),
    ADMIN_ROUTES.operations,
  ],
  [
    "a field Activity has no words for",
    { action: "SETTINGS_CHANGE", subject: { type: "operations" }, changed: ["somethingNew"] },
    ADMIN_TEXT.didChangeOperations("somethingNew"),
    ADMIN_ROUTES.operations,
  ],
  [
    "Operations saved unchanged",
    { action: "SETTINGS_CHANGE", subject: { type: "operations" } },
    ADMIN_TEXT.didSaveOperations,
    ADMIN_ROUTES.operations,
  ],
  [
    "an image uploaded",
    { action: "CREATE", subject: image },
    ADMIN_TEXT.didUpload(ADMIN_TEXT.theImage("A nurse at a bedside")),
    ADMIN_ROUTES.media,
  ],
  [
    "a brochure uploaded",
    { action: "CREATE", subject: { type: "media", kind: "PDF", name: null } },
    ADMIN_TEXT.didUpload(ADMIN_TEXT.aBrochure),
    ADMIN_ROUTES.settings,
  ],
  [
    "an image's words changed",
    { action: "UPDATE", subject: { type: "media", kind: "IMAGE", name: null } },
    ADMIN_TEXT.didEditWords(ADMIN_TEXT.anImage),
    ADMIN_ROUTES.media,
  ],
  [
    "a deleted image",
    { action: "DELETE", subject: { type: "media", kind: null, name: null } },
    ADMIN_TEXT.didDelete(ADMIN_TEXT.anImage),
    null,
  ],
  [
    "a service added",
    { action: "CREATE", subject: service },
    ADMIN_TEXT.didCreate(ADMIN_TEXT.theRecord.SERVICES("Elderly care")),
    ADMIN_ROUTES.service("s1"),
  ],
  [
    "a service restored",
    { action: "UPDATE", subject: service, changed: ["archived"], to: false },
    ADMIN_TEXT.didRestore(ADMIN_TEXT.theRecord.SERVICES("Elderly care")),
    ADMIN_ROUTES.service("s1"),
  ],
  [
    "a client logo archived, its name unknown",
    { action: "ARCHIVE", subject: { type: "record", collection: "CLIENTS", id: "c1", name: null } },
    ADMIN_TEXT.didArchive(ADMIN_TEXT.aRecord.CLIENTS),
    ADMIN_ROUTES.client("c1"),
  ],
  [
    "a job closed",
    { action: "STATUS_CHANGE", subject: job, changed: ["closed"], to: true },
    ADMIN_TEXT.didClose(ADMIN_TEXT.theRecord.JOBS("Registered nurse")),
    ADMIN_ROUTES.job("j1"),
  ],
  [
    "a job reopened",
    { action: "STATUS_CHANGE", subject: job, changed: ["closed"], to: false },
    ADMIN_TEXT.didReopen(ADMIN_TEXT.theRecord.JOBS("Registered nurse")),
    ADMIN_ROUTES.job("j1"),
  ],
  [
    "a page's draft saved",
    { action: "UPDATE", subject: { type: "page", page: "HOME" } },
    ADMIN_TEXT.didSave(ADMIN_TEXT.thePage("Home")),
    ADMIN_ROUTES.page("HOME"),
  ],
  [
    "Settings published",
    { action: "PUBLISH", subject: { type: "settings" } },
    ADMIN_TEXT.didPublish(ADMIN_TEXT.theSettings),
    ADMIN_ROUTES.settings,
  ],
  [
    "the client logos' order discarded",
    { action: "DISCARD_DRAFT", subject: { type: "order", collection: "CLIENTS" } },
    ADMIN_TEXT.didDiscard(ADMIN_TEXT.theOrder.CLIENTS),
    ADMIN_ROUTES.clients,
  ],
  [
    "the services reordered",
    { action: "REORDER", subject: { type: "order", collection: "SERVICES" } },
    ADMIN_TEXT.didReorder(ADMIN_TEXT.theOrder.SERVICES),
    ADMIN_ROUTES.services,
  ],
  [
    "an enquiry moved",
    { action: "STATUS_CHANGE", subject: enquiry, changed: ["status"], to: "RESOLVED" },
    ADMIN_TEXT.didMove(ADMIN_TEXT.anEnquiry, "Resolved"),
    ADMIN_ROUTES.enquiry("e1"),
  ],
  [
    "an application moved",
    { action: "STATUS_CHANGE", subject: application, changed: ["status"], to: "SHORTLISTED" },
    ADMIN_TEXT.didMove(ADMIN_TEXT.anApplication, "Shortlisted"),
    ADMIN_ROUTES.application("a1"),
  ],
  [
    "an enquiry's email sent again",
    { action: "UPDATE", subject: enquiry, changed: ["emailStatus"], to: "SENT" },
    ADMIN_TEXT.didSendAgain(ADMIN_TEXT.anEnquiry),
    ADMIN_ROUTES.enquiry("e1"),
  ],
  [
    "an application's email tried again, since deleted",
    { action: "UPDATE", subject: { ...application, exists: false }, changed: ["emailStatus"], to: "NOT_SENT" },
    ADMIN_TEXT.didNotSendAgain(ADMIN_TEXT.anApplication),
    null,
  ],
  [
    "a note added",
    { action: "NOTE_ADD", subject: application },
    ADMIN_TEXT.didAddNote(ADMIN_TEXT.anApplication),
    ADMIN_ROUTES.application("a1"),
  ],
  [
    "a CV downloaded",
    { action: "CV_DOWNLOAD", subject: application },
    ADMIN_TEXT.didDownloadCv(ADMIN_TEXT.anApplication),
    ADMIN_ROUTES.application("a1"),
  ],
  [
    "a deleted enquiry",
    { action: "DELETE", subject: { ...enquiry, exists: false } },
    ADMIN_TEXT.didDelete(ADMIN_TEXT.anEnquiry),
    null,
  ],
];

describe("ActivityRow (D96)", () => {
  it.each(CASES)("says %s in plain words, opening it while it is there", (_, entry, line, href) => {
    render(<ActivityRow item={item(entry)} />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent(line);
    if (href) expect(screen.getByRole("link", { name: line })).toHaveAttribute("href", href);
    else expect(screen.queryByRole("link")).toBeNull();
  });

  it("says when, and who: the admin by name, the website itself, the sign-in page, or an account since removed", () => {
    const { rerender } = render(<ActivityRow item={item({})} />);
    expect(screen.getByText(dohaTime(new Date(AT)))).toHaveAttribute("datetime", AT);
    expect(screen.getByText("Fatima")).toBeVisible();
    rerender(
      <ActivityRow
        item={item({ action: "RETENTION_PURGE", who: null, counts: { enquiries: 0, applications: 0, cvs: 0 } })}
      />,
    );
    expect(screen.getByText(ADMIN_TEXT.theWebsite)).toBeVisible();
    rerender(<ActivityRow item={item({ action: "PASSWORD_RESET_REQUESTED", who: null })} />);
    expect(screen.getByText(ADMIN_TEXT.fromSignInPage)).toBeVisible();
    // An audit row outlives its admin's account: the change is kept, its maker no longer named.
    rerender(<ActivityRow item={item({ action: "PUBLISH", subject: { type: "settings" }, who: null })} />);
    expect(screen.getByText(ADMIN_TEXT.formerAdmin)).toBeVisible();
  });
});
