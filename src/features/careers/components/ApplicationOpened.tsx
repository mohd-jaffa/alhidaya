"use client";

import { usePathname, useRouter } from "next/navigation";

import { DeleteAction } from "@/components/admin/DeleteAction";
import { EmailNotSent } from "@/components/admin/EmailNotSent";
import { MoveTo } from "@/components/admin/MoveTo";
import { ReachActions } from "@/components/admin/ReachActions";
import { TeamNotes } from "@/components/admin/TeamNotes";
import { Button, buttonClasses } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_ROUTES, API_ROUTES } from "@/constants/routes";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES } from "@/constants/statuses";
import { errorMessage } from "@/lib/errors/errorMessage";
import { formatBytes } from "@/lib/files/size";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { applicationNoteSchema } from "@/lib/validation";

import { ApplicationsClient } from "../api.client";
import type { ApplicationOpened as Opened } from "../types";

/** The lists an application is in: its inbox, and Today. */
const LISTS = [API_ROUTES.adminApplications, API_ROUTES.adminToday];

/** Why a CV is not there to download, in words and tone (plan §9.3, §9.4). */
const CV_ABSENT = {
  PENDING: { tone: "info", title: ADMIN_TEXT.cvPending, body: ADMIN_TEXT.cvPendingBody },
  NOT_STORED: { tone: "error", title: ADMIN_TEXT.cvNotStored, body: ADMIN_TEXT.cvNotStoredBody },
  EXPIRED: { tone: "info", title: ADMIN_TEXT.cvExpired, body: ADMIN_TEXT.cvExpiredBody },
} as const;

/**
 * The CV as uploaded, and Download while it is kept: a plain link, never
 * fetched ahead, because every download is recorded (plan §9.4).
 */
function CvPart({ application }: { application: Opened }) {
  const absent = application.cvStatus === "STORED" ? null : CV_ABSENT[application.cvStatus];
  return (
    <section aria-labelledby={`cv-${application.id}`} className="grid gap-3">
      <h4 id={`cv-${application.id}`} className="font-bold">
        {ADMIN_TEXT.cv}
      </h4>
      <p className="break-words text-ink-2">
        {application.cvName} · {formatBytes(application.cvBytes)}
      </p>
      {absent ? (
        <Notice tone={absent.tone} title={absent.title}>
          {absent.body}
        </Notice>
      ) : (
        <a
          href={API_ROUTES.adminApplicationCv(application.id)}
          download
          className={buttonClasses({ variant: "secondary" }, "justify-self-start")}
        >
          <Pictogram name="download" size="sm" />
          <span>{ADMIN_TEXT.downloadCv}</span>
        </a>
      )}
    </section>
  );
}

/**
 * An application opened in its row (plan §9.5, R6.1): the job, every answer
 * as the applicant gave it, the ways to answer them, the CV, where it
 * stands, the HR email's Retry when it did not go, the team's notes and
 * Delete (D82), all in place. Deleted on its own page (the HR email's link),
 * the inbox takes its place.
 */
export function ApplicationOpened({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useApiQuery<Opened>(API_ROUTES.adminApplication(id));
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
  const stale = [...LISTS, API_ROUTES.adminApplication(id)];
  const answers = [{ label: ADMIN_TEXT.job, value: data.jobTitle ?? ADMIN_TEXT.generalApplication }, ...data.fields];
  return (
    <div className="grid gap-6">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {answers.map((field) => (
          <div key={field.label} className={field.value.length > 80 ? "sm:col-span-2" : undefined}>
            <dt className="text-small font-semibold text-ink-2">{field.label}</dt>
            <dd className="whitespace-pre-line break-words">{field.value}</dd>
          </div>
        ))}
      </dl>
      <ReachActions phone={data.phone} email={data.email} />
      <CvPart application={data} />
      <MoveTo
        current={data.status}
        statuses={APPLICATION_STATUSES}
        labels={APPLICATION_STATUS_LABELS}
        move={(status) => ApplicationsClient.setStatus({ id, status })}
        revalidate={stale}
      />
      {data.emailStatus === "NOT_SENT" ? (
        <EmailNotSent
          title={ADMIN_TEXT.hrEmailNotSent}
          body={ADMIN_TEXT.hrEmailNotSentBody}
          action={ADMIN_TEXT.retryHrEmail}
          retry={() => ApplicationsClient.retryAlert(id)}
          revalidate={stale}
        />
      ) : null}
      <TeamNotes
        id={id}
        notes={data.notes}
        schema={applicationNoteSchema}
        add={(body) => ApplicationsClient.addNote({ id, body })}
        revalidate={[API_ROUTES.adminApplication(id)]}
      />
      <DeleteAction
        title={ADMIN_TEXT.deleteApplicationTitle(data.name)}
        body={ADMIN_TEXT.deleteApplicationBody}
        remove={() => ApplicationsClient.remove(id)}
        revalidate={LISTS}
        afterwards={() => {
          if (pathname === ADMIN_ROUTES.application(id)) router.replace(ADMIN_ROUTES.applications);
        }}
      />
    </div>
  );
}
