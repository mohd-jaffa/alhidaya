"use client";

import { usePathname, useRouter } from "next/navigation";

import { DeleteAction } from "@/components/admin/DeleteAction";
import { EmailNotSent } from "@/components/admin/EmailNotSent";
import { MoveTo } from "@/components/admin/MoveTo";
import { ReachActions } from "@/components/admin/ReachActions";
import { TeamNotes } from "@/components/admin/TeamNotes";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES, API_ROUTES } from "@/constants/routes";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUSES } from "@/constants/statuses";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { enquiryNoteSchema } from "@/lib/validation";

import { EnquiriesClient } from "../api.client";
import type { EnquiryOpened as Opened } from "../types";

/** The lists an enquiry is in: its inbox, and Today. */
const LISTS = [API_ROUTES.adminEnquiries, API_ROUTES.adminToday];

/**
 * An enquiry opened in its row (plan §10.5, R6.1): every answer as the
 * visitor gave it, the ways to answer them, where it stands, the team's
 * notes and Delete (D82), all in place. A change refreshes the lists it
 * belongs to; deleted on its own page (the alert email's link), the inbox
 * takes its place.
 */
export function EnquiryOpened({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useApiQuery<Opened>(API_ROUTES.adminEnquiry(id));
  const router = useRouter();
  const pathname = usePathname();
  if (error) {
    return (
      <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
        <p>{errorMessage(error)}</p>
        <Button variant="secondary" onClick={() => mutate()} className="mt-3">
          {ADMIN_TEXT.tryAgain}
        </Button>
      </Notice>
    );
  }
  if (isLoading || !data) return <p aria-busy="true" className="h-40 animate-pulse rounded-panel bg-rule/40" />;
  const stale = [...LISTS, API_ROUTES.adminEnquiry(id)];
  return (
    <div className="grid gap-6">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {data.fields.map((field) => (
          <div key={field.label} className={field.value.length > 80 ? "sm:col-span-2" : undefined}>
            <dt className="text-small font-semibold text-ink-2">{field.label}</dt>
            <dd className="whitespace-pre-line break-words">{field.value}</dd>
          </div>
        ))}
      </dl>
      <ReachActions phone={data.phone} email={data.email} />
      <MoveTo
        current={data.status}
        statuses={ENQUIRY_STATUSES}
        labels={ENQUIRY_STATUS_LABELS}
        move={(status) => EnquiriesClient.setStatus({ id, status })}
        revalidate={stale}
      />
      {data.emailStatus === "NOT_SENT" ? (
        <EmailNotSent
          title={ADMIN_TEXT.alertNotSent}
          body={ADMIN_TEXT.alertNotSentBody}
          action={ADMIN_TEXT.retryAlert}
          retry={() => EnquiriesClient.retryAlert(id)}
          revalidate={stale}
        />
      ) : null}
      <TeamNotes
        id={id}
        notes={data.notes}
        schema={enquiryNoteSchema}
        add={(body) => EnquiriesClient.addNote({ id, body })}
        revalidate={[API_ROUTES.adminEnquiry(id)]}
      />
      <DeleteAction
        title={ADMIN_TEXT.deleteEnquiryTitle(data.name)}
        body={ADMIN_TEXT.deleteEnquiryBody}
        remove={() => EnquiriesClient.remove(id)}
        revalidate={LISTS}
        afterwards={() => {
          if (pathname === ADMIN_ROUTES.enquiry(id)) router.replace(ADMIN_ROUTES.enquiries);
        }}
      />
    </div>
  );
}
