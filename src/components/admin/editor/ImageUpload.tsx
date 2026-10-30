"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { UPLOAD_LIMITS } from "@/constants/limits";
import { VALIDATION_MESSAGES } from "@/constants/messages";
import { FILE_TYPES, IMAGE_TYPES } from "@/constants/uploads";
import { MediaClient } from "@/features/media/api.client";
import type { LibraryImageItem } from "@/features/media/types";
import { errorMessage } from "@/lib/errors/errorMessage";
import { formatBytes } from "@/lib/files/size";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type ImageDetailsInput, type ImageDetailsPayload, imageDetailsSchema } from "@/lib/validation";

import { ImageWords, imageWordsOf } from "./ImageWords";

/** What the picker offers: a suggestion to the browser, never the check, which reads the file's bytes. */
const ACCEPT = IMAGE_TYPES.map((type) => FILE_TYPES[type].mime).join(",");

/**
 * Uploads an image to the library (plan §15, D93): the file, what it shows
 * (or Decorative) and, for a stock photo, where it came from. The server
 * reads its type from its bytes and keeps it in its sizes; a refusal is said
 * here. Uploaded, the library is read afresh and `onUploaded` has it.
 */
export function ImageUpload({ onUploaded }: { onUploaded: (image: LibraryImageItem) => void }) {
  const form = useForm<ImageDetailsInput, unknown, ImageDetailsPayload>({
    resolver: zodResolver(imageDetailsSchema),
    defaultValues: imageWordsOf(),
  });
  const refresh = useRevalidate();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [failure, setFailure] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setFailure(null);
    try {
      const image = await MediaClient.upload({ file, details: form.getValues() });
      await refresh([ADMIN_API_ROUTES.adminMedia]);
      onUploaded(image);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };
  const missingFile = () => {
    if (!file) setFileError(VALIDATION_MESSAGES.required("The image"));
  };

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(event) => {
          missingFile();
          void form.handleSubmit(upload)(event);
        }}
      >
        {failure ? (
          <Notice tone="error" title={ADMIN_TEXT.notUploaded}>
            <p>{failure}</p>
          </Notice>
        ) : null}
        <Field
          label={ADMIN_TEXT.imageFile}
          hint={ADMIN_TEXT.imageFileHint(formatBytes(UPLOAD_LIMITS.imageBytes))}
          error={fileError}
          required
        >
          <FileInput
            accept={ACCEPT}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setFileError(undefined);
            }}
          />
        </Field>
        <ImageWords />
        <Button type="submit" pending={uploading} className="justify-self-start">
          {uploading ? ADMIN_TEXT.uploading : ADMIN_TEXT.upload}
        </Button>
      </form>
    </FormProvider>
  );
}
