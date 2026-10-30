"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { AskedAction } from "@/components/admin/AskedAction";
import { DraftEditor } from "@/components/admin/editor/DraftEditor";
import { EditorDate } from "@/components/admin/editor/EditorDate";
import { EditorGroup } from "@/components/admin/editor/EditorGroup";
import { EditorLoading } from "@/components/admin/editor/EditorLoading";
import { EditorSelect } from "@/components/admin/editor/EditorSelect";
import { EditorText } from "@/components/admin/editor/EditorText";
import { PointsField } from "@/components/admin/editor/PointsField";
import { RichTextField } from "@/components/admin/editor/RichTextField";
import { SeoFields } from "@/components/admin/editor/SeoFields";
import { SlugField } from "@/components/admin/editor/SlugField";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES, ADMIN_ROUTES } from "@/constants/admin-routes";
import { LIST_LIMITS, TEXT_LIMITS } from "@/constants/limits";
import { ROUTES } from "@/constants/routes";
import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES } from "@/constants/statuses";
import { dohaDay } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type JobDocument, type JobDocumentInput, jobDocumentSchema } from "@/lib/validation";

import { JobsClient } from "../api.client";
import type { JobDraftItem } from "../types";

/** A new job, posted today in Doha, blank for the admin to fill: refused until it is. */
const blankJob = (): JobDocumentInput => ({
  title: { en: "" },
  slug: "",
  department: { en: "" },
  location: { en: "" },
  employmentType: "FULL_TIME",
  experience: { en: "" },
  summary: { en: "" },
  description: [],
  responsibilities: [],
  qualifications: [],
  benefits: [],
  postedOn: dohaDay(),
  closesOn: null,
  seo: { title: { en: "" }, description: { en: "" } },
});

const TYPE_OPTIONS = EMPLOYMENT_TYPES.map((type) => [type, EMPLOYMENT_TYPE_LABELS[type]] as const);

/** Whether the website takes applications for it, and Close now or Reopen (D92). */
function Applications({ item, name, show }: { item: JobDraftItem; name: string; show: (job: JobDraftItem) => void }) {
  if (!item.publishedAt || item.archivedAt) return item.archivedAt ? null : <p>{ADMIN_TEXT.publishToOpen}</p>;
  const closed = item.draft.closed;
  return (
    <div className="grid gap-3">
      <p>{item.open ? ADMIN_TEXT.takingApplications : ADMIN_TEXT.notTakingApplications}</p>
      {item.open || closed ? (
        <AskedAction
          label={closed ? ADMIN_TEXT.reopen : ADMIN_TEXT.closeNow}
          title={closed ? ADMIN_TEXT.reopenTitle(name) : ADMIN_TEXT.closeTitle(name)}
          body={closed ? ADMIN_TEXT.reopenBody : ADMIN_TEXT.closeBody}
          keep={ADMIN_TEXT.keepEditing}
          failed={closed ? ADMIN_TEXT.notReopened : ADMIN_TEXT.notClosed}
          act={() => JobsClient.setClosed({ id: item.id, closed: !closed })}
          afterwards={show}
        />
      ) : null}
    </div>
  );
}

/**
 * A job in the editor (D92): what it is and its address, its dates, its
 * description and lists, its words for search engines, whether it takes
 * applications, and taking it off the website. A new one is made on its
 * first save, and the address bar then names it.
 */
function JobForm({ initial }: { initial: JobDraftItem | null }) {
  const [item, setItem] = useState(initial);
  // Publish may follow a first save at once, before the screen has drawn it again.
  const id = useRef(initial?.id ?? null);
  const form = useForm<JobDocumentInput, unknown, JobDocument>({
    resolver: zodResolver(jobDocumentSchema),
    defaultValues: initial?.draft ?? blankJob(),
  });
  const refresh = useRevalidate();
  const show = async (saved: JobDraftItem, reset = true) => {
    // Made by its first save: the address bar names it from now on, without leaving the editor.
    if (id.current !== saved.id) {
      window.history.replaceState(null, "", ADMIN_ROUTES.job(saved.id));
    }
    id.current = saved.id;
    setItem(saved);
    if (reset) form.reset(saved.draft);
    await refresh([ADMIN_API_ROUTES.adminJobs, ADMIN_API_ROUTES.adminJob(saved.id)]);
  };
  const name = item?.draft.title.en || ADMIN_TEXT.newJob;

  return (
    <DraftEditor
      form={form}
      name={name}
      back={{ href: ADMIN_ROUTES.jobs, label: ADMIN_TEXT.jobs }}
      state={item ?? { publishedAt: null, unpublishedChanges: true }}
      path={item ? ROUTES.job(item.draft.slug) : null}
      save={async (document) => {
        const saved = id.current
          ? await JobsClient.save({ id: id.current, document })
          : await JobsClient.create(document);
        await show(saved);
      }}
      publish={async () => show(await JobsClient.publish(id.current!), false)}
      discard={async () => show(await JobsClient.discard(id.current!))}
    >
      <EditorGroup title={ADMIN_TEXT.aboutJob}>
        <EditorText name="title.en" label={ADMIN_TEXT.title} max={TEXT_LIMITS.heading} required />
        <SlugField from="title.en" address={ROUTES.job} follow={!item?.publishedAt} />
        <EditorText name="department.en" label={ADMIN_TEXT.department} max={TEXT_LIMITS.department} />
        <EditorText name="location.en" label={ADMIN_TEXT.location} max={TEXT_LIMITS.heading} required />
        <EditorSelect name="employmentType" label={ADMIN_TEXT.employmentType} options={TYPE_OPTIONS} />
        <EditorText name="experience.en" label={ADMIN_TEXT.experience} max={TEXT_LIMITS.heading} />
        <EditorText
          name="summary.en"
          label={ADMIN_TEXT.summary}
          hint={ADMIN_TEXT.jobSummaryHint}
          max={TEXT_LIMITS.lede}
          required
          multiline
          rows={3}
        />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.dates}>
        <EditorDate name="postedOn" label={ADMIN_TEXT.postedOn} required />
        <EditorDate name="closesOn" label={ADMIN_TEXT.closesOn} hint={ADMIN_TEXT.closesOnHint} />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.description}>
        <RichTextField name="description" label={ADMIN_TEXT.description} hideLabel />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.responsibilities}>
        <PointsField
          name="responsibilities"
          label={ADMIN_TEXT.responsibilities}
          item={ADMIN_TEXT.responsibility}
          max={LIST_LIMITS.jobPoints}
          hideLabel
        />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.qualifications}>
        <PointsField
          name="qualifications"
          label={ADMIN_TEXT.qualifications}
          item={ADMIN_TEXT.qualification}
          max={LIST_LIMITS.jobPoints}
          hideLabel
        />
      </EditorGroup>
      <EditorGroup title={ADMIN_TEXT.benefits}>
        <PointsField
          name="benefits"
          label={ADMIN_TEXT.benefits}
          item={ADMIN_TEXT.benefit}
          max={LIST_LIMITS.jobPoints}
          hideLabel
        />
      </EditorGroup>
      <SeoFields hint={ADMIN_TEXT.jobSeoHint} />
      {item ? (
        <EditorGroup title={ADMIN_TEXT.onTheSite}>
          <Applications item={item} name={name} show={(job) => void show(job, false)} />
          {item.archivedAt ? <p>{ADMIN_TEXT.isArchived}</p> : null}
          <AskedAction
            label={item.archivedAt ? ADMIN_TEXT.restore : ADMIN_TEXT.archive}
            title={item.archivedAt ? ADMIN_TEXT.restoreTitle(name) : ADMIN_TEXT.archiveTitle(name)}
            body={item.archivedAt ? ADMIN_TEXT.restoreBody : ADMIN_TEXT.archiveJobBody}
            keep={ADMIN_TEXT.keepEditing}
            failed={item.archivedAt ? ADMIN_TEXT.notRestored : ADMIN_TEXT.notArchived}
            act={() => JobsClient.setArchived({ id: item.id, archived: !item.archivedAt })}
            afterwards={(saved) => show(saved, false)}
          />
        </EditorGroup>
      ) : null}
    </DraftEditor>
  );
}

/** A saved job's editor: its draft read once, then edited in place until saved. */
function SavedJob({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useApiQuery<JobDraftItem>(ADMIN_API_ROUTES.adminJob(id));
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
  if (isLoading || !data) return <EditorLoading />;
  return <JobForm initial={data} />;
}

/** A job's editor (R6.4, D92): a new one when there is no id yet. */
export function JobEditor({ id }: { id: string | null }) {
  return id ? <SavedJob id={id} /> : <JobForm initial={null} />;
}
