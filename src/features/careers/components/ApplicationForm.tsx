"use client";

import { SiteForm } from "@/components/site/SiteForm";
import { choiceOptions, RadioGroup } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { TEXT_LIMITS, UPLOAD_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import {
  DATAFLOW,
  DATAFLOW_LABELS,
  MOPH_LICENCE,
  MOPH_LICENCE_LABELS,
  PROMETRIC,
  PROMETRIC_LABELS,
  WHERE_NOW,
  WHERE_NOW_LABELS,
} from "@/constants/statuses";
import { CV_ACCEPT } from "@/constants/uploads";
import { formatBytes } from "@/lib/files/size";

import { CareersClient } from "../form.client";

const schema = () => import("@/lib/validation/schemas/applications").then((module) => module.applicationFormSchema);

/**
 * The application form (plan §9.2, Q7): who the nurse is, where they are
 * with Qatar's licensing, their experience, their CV and a note. For a job
 * (`jobId`) or, without one, a general application.
 */
export function ApplicationForm({ jobId, siteKey }: { jobId: string | null; siteKey: string }) {
  return (
    <SiteForm
      schema={schema}
      send={CareersClient.apply}
      action={UI_TEXT.sendApplication}
      sent={UI_TEXT.applicationSent}
      sentNext={UI_TEXT.applicationSentNext}
      notSent={UI_TEXT.applicationNotSent}
      botCheck={{ siteKey, action: "application" }}
    >
      {(errors) => (
        <>
          <input type="hidden" name="jobId" value={jobId ?? ""} />
          <Field label={UI_TEXT.fullName} required error={errors.name}>
            <TextInput name="name" autoComplete="name" maxLength={TEXT_LIMITS.name} />
          </Field>
          <Field label={UI_TEXT.email} required error={errors.email}>
            <TextInput name="email" type="email" autoComplete="email" maxLength={TEXT_LIMITS.email} />
          </Field>
          <Field label={UI_TEXT.phone} hint={UI_TEXT.phoneHint} required error={errors.phone}>
            <TextInput name="phone" type="tel" autoComplete="tel" maxLength={TEXT_LIMITS.phone} />
          </Field>
          <RadioGroup
            legend={UI_TEXT.whereNow}
            name="whereNow"
            options={choiceOptions(WHERE_NOW, WHERE_NOW_LABELS)}
            required
            error={errors.whereNow}
          />
          <RadioGroup
            legend={UI_TEXT.mophLicence}
            name="mophLicence"
            options={choiceOptions(MOPH_LICENCE, MOPH_LICENCE_LABELS)}
            required
            error={errors.mophLicence}
          />
          <RadioGroup
            legend={UI_TEXT.dataflow}
            name="dataflow"
            options={choiceOptions(DATAFLOW, DATAFLOW_LABELS)}
            required
            error={errors.dataflow}
          />
          <RadioGroup
            legend={UI_TEXT.prometric}
            name="prometric"
            options={choiceOptions(PROMETRIC, PROMETRIC_LABELS)}
            required
            error={errors.prometric}
          />
          <Field
            label={UI_TEXT.experienceYears}
            hint={UI_TEXT.experienceYearsHint}
            required
            error={errors.experienceYears}
          >
            <TextInput name="experienceYears" inputMode="numeric" autoComplete="off" maxLength={2} />
          </Field>
          <Field
            label={UI_TEXT.cv}
            hint={UI_TEXT.cvHint(formatBytes(UPLOAD_LIMITS.cvBytes))}
            required
            error={errors.cv}
          >
            <FileInput name="cv" accept={CV_ACCEPT} />
          </Field>
          <Field label={UI_TEXT.applicationNote} hint={UI_TEXT.applicationNoteHint} error={errors.note}>
            <TextArea name="note" maxLength={TEXT_LIMITS.note} />
          </Field>
        </>
      )}
    </SiteForm>
  );
}
