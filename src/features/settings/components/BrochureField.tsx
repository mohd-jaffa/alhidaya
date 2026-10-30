"use client";

import { useState } from "react";
import { useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Notice } from "@/components/ui/notice";
import { Pictogram } from "@/components/ui/pictogram";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UPLOAD_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { FILE_TYPES } from "@/constants/uploads";
import { errorMessage } from "@/lib/errors/errorMessage";
import { formatBytes } from "@/lib/files/size";

import { SiteClient } from "../api.client";
import type { SiteDraftItem } from "../types";

type PdfFile = NonNullable<SiteDraftItem["brochure"]>;

/**
 * The brochure (plan §12, D94): the PDF the draft names, to open and check,
 * or none; a new one uploaded here is named by the draft at once, and goes
 * live with Settings' Publish; Remove leaves the website without one.
 */
export function BrochureField({ known }: { known: PdfFile | null }) {
  const { field } = useController({ name: "brochure" });
  const value = field.value as { mediaId: string } | null;
  const [uploaded, setUploaded] = useState<PdfFile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [failure, setFailure] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const current = [uploaded, known].find((pdf) => pdf && pdf.id === value?.mediaId);

  const upload = async () => {
    if (!file) {
      setFileError(VALIDATION_MESSAGES.required("The PDF"));
      return;
    }
    setUploading(true);
    setFailure(null);
    try {
      const pdf = await SiteClient.uploadBrochure(file);
      setUploaded(pdf);
      field.onChange({ mediaId: pdf.id });
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-4">
      {current ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={current.url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 font-semibold text-deep underline-offset-4 hover:underline"
          >
            <Pictogram name="download" size="sm" />
            {ADMIN_TEXT.openBrochure}
          </a>
          <span className="text-small text-ink-2">{formatBytes(current.bytes)}</span>
          <Button variant="quiet" onClick={() => field.onChange(null)}>
            {ADMIN_TEXT.removeBrochure}
          </Button>
        </div>
      ) : (
        <p className="text-ink-2">{ADMIN_TEXT.noBrochure}</p>
      )}
      {failure ? (
        <Notice tone="error" title={ADMIN_TEXT.brochureNotUploaded}>
          <p>{failure}</p>
        </Notice>
      ) : null}
      <Field
        label={ADMIN_TEXT.brochureFile}
        hint={ADMIN_TEXT.brochureHint(formatBytes(UPLOAD_LIMITS.brochureBytes))}
        error={fileError}
        markOptional={false}
      >
        <FileInput
          accept={FILE_TYPES.pdf.mime}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setFileError(undefined);
          }}
        />
      </Field>
      <Button
        variant="secondary"
        pictogram="upload"
        pending={uploading}
        onClick={upload}
        className="justify-self-start"
      >
        {ADMIN_TEXT.uploadBrochure}
      </Button>
    </div>
  );
}
