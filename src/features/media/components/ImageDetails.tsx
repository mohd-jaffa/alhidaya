"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { AskedAction } from "@/components/admin/AskedAction";
import { ImageWords, imageWordsOf } from "@/components/admin/editor/ImageWords";
import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { readableDay } from "@/lib/dates";
import { errorMessage } from "@/lib/errors/errorMessage";
import { formatBytes } from "@/lib/files/size";
import { useRevalidate } from "@/lib/query/useRevalidate";
import { type ImageDetailsInput, type ImageDetailsPayload, imageDetailsSchema } from "@/lib/validation";

import { MediaClient } from "../api.client";
import type { LibraryImageItem } from "../types";

/**
 * One image of the library (plan §15, D93): seen large, with its size and
 * when it came; its words changed and saved; where it is used, each place
 * opening its editor; and Delete, asked first, once nothing uses it.
 */
export function ImageDetails({ image, onDeleted }: { image: LibraryImageItem; onDeleted: () => void }) {
  const form = useForm<ImageDetailsInput, unknown, ImageDetailsPayload>({
    resolver: zodResolver(imageDetailsSchema),
    defaultValues: imageWordsOf(image),
  });
  const refresh = useRevalidate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setFailure(null);
    try {
      const updated = await MediaClient.update({ id: image.id, details: form.getValues() });
      form.reset(imageWordsOf(updated));
      await refresh([ADMIN_API_ROUTES.adminMedia]);
      setSaved(true);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-start">
        <MediaImage image={image} sizes="16rem" className="w-full rounded-control bg-mist object-contain" />
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
          <dt className="text-ink-2">{ADMIN_TEXT.dimensions}</dt>
          <dd>{ADMIN_TEXT.imageSize(image.width, image.height)}</dd>
          <dt className="text-ink-2">{ADMIN_TEXT.fileSize}</dt>
          <dd>{formatBytes(image.bytes)}</dd>
          <dt className="text-ink-2">{ADMIN_TEXT.uploadedOn}</dt>
          <dd>{readableDay(image.createdAt.slice(0, 10))}</dd>
        </dl>
      </div>

      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(save)} className="grid gap-4">
          {failure ? (
            <Notice tone="error" title={ADMIN_TEXT.notSaved}>
              <p>{failure}</p>
            </Notice>
          ) : null}
          {saved && !form.formState.isDirty ? <Notice tone="success" title={ADMIN_TEXT.detailsSaved} /> : null}
          <ImageWords />
          <Button type="submit" variant="secondary" pending={saving} className="justify-self-start">
            {ADMIN_TEXT.saveDetails}
          </Button>
        </form>
      </FormProvider>

      <section aria-labelledby="used-in" className="grid gap-2 border-t border-rule pt-4">
        <h3 id="used-in" className="font-bold">
          {ADMIN_TEXT.usedIn}
        </h3>
        {image.usedIn.length === 0 ? (
          <p className="text-ink-2">{ADMIN_TEXT.notUsed}</p>
        ) : (
          <ul className="grid gap-1">
            {image.usedIn.map((place) => (
              <li key={place.href}>
                <Link href={place.href} className="font-semibold text-deep underline-offset-4 hover:underline">
                  {place.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-rule pt-4">
        {image.usedIn.length > 0 ? (
          <p className="text-small text-ink-2">{ADMIN_TEXT.inUseNote}</p>
        ) : (
          <AskedAction
            label={ADMIN_TEXT.delete}
            pendingLabel={ADMIN_TEXT.deleting}
            title={ADMIN_TEXT.deleteImageTitle}
            body={ADMIN_TEXT.deleteImageBody}
            keep={ADMIN_TEXT.keep}
            failed={ADMIN_TEXT.notDeleted}
            act={() => MediaClient.remove(image.id)}
            revalidate={[ADMIN_API_ROUTES.adminMedia]}
            afterwards={onDeleted}
          />
        )}
      </div>
    </div>
  );
}
