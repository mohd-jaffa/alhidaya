"use client";

import { SiteForm } from "@/components/site/SiteForm";
import { ChoiceGroup, choiceOptions, RadioGroup } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { TextArea, TextInput } from "@/components/ui/text-input";
import { TEXT_LIMITS, UPLOAD_LIMITS } from "@/constants/limits";
import { UI_TEXT } from "@/constants/messages";
import {
  APPLICATION_SCREENING_FIELDS,
  type ApplicationQuestionField,
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

import type { AskedQuestion } from "../api";
import { answerField, CareersClient } from "../form.client";

const SCREENING_OPTIONS = {
  whereNow: choiceOptions(WHERE_NOW, WHERE_NOW_LABELS),
  mophLicence: choiceOptions(MOPH_LICENCE, MOPH_LICENCE_LABELS),
  dataflow: choiceOptions(DATAFLOW, DATAFLOW_LABELS),
  prometric: choiceOptions(PROMETRIC, PROMETRIC_LABELS),
};

/** The form's schema, with the job's own questions and their selection modes (D210). */
const schemaFor = (jobId: string | null, questions: readonly AskedQuestion[], hideExperience: boolean) => () =>
  import("@/lib/validation/schemas/applications").then((module) =>
    module.withJobQuestions(
      jobId,
      questions.map((question, index) => ({ ...question, field: answerField(index) })),
      hideExperience,
    ),
  );

/**
 * The application form (plan §9.2, Q7): who the nurse is, where they are
 * with Qatar's licensing, the job's own questions (D209), their experience,
 * their CV and a note. For a job (`jobId`) or, without one, a general
 * application.
 */
export function ApplicationForm({
  jobId,
  siteKey,
  questions = [],
  hiddenQuestions = [],
}: {
  jobId: string | null;
  siteKey: string;
  /** The job's own questions, asked after the fixed ones; none for a general application. */
  questions?: readonly AskedQuestion[];
  hiddenQuestions?: readonly ApplicationQuestionField[];
}) {
  const hideExperience = jobId !== null && hiddenQuestions.includes("experienceYears");
  return (
    <SiteForm
      schema={schemaFor(jobId, questions, hideExperience)}
      send={(values) =>
        CareersClient.apply(
          values,
          questions.map(({ question }) => question),
        )
      }
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
          {APPLICATION_SCREENING_FIELDS.filter((field) => !hiddenQuestions.includes(field)).map((field) => (
            <RadioGroup
              key={field}
              legend={UI_TEXT[field]}
              name={field}
              options={SCREENING_OPTIONS[field]}
              required={jobId === null}
              error={errors[field]}
            />
          ))}
          {questions.map(({ question, choices, selection }, index) => (
            <ChoiceGroup
              key={answerField(index)}
              legend={question}
              name={answerField(index)}
              options={choices.map((choice) => ({ value: choice, label: choice }))}
              multiple={selection === "multiple"}
              required
              error={errors[answerField(index)]}
            />
          ))}
          {hideExperience ? null : (
            <Field
              label={UI_TEXT.experienceYears}
              hint={UI_TEXT.experienceYearsHint}
              required
              error={errors.experienceYears}
            >
              <TextInput name="experienceYears" inputMode="numeric" autoComplete="off" maxLength={2} />
            </Field>
          )}
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
