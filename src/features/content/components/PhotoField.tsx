"use client";

import { useId, useState } from "react";
import { useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { MediaImage } from "@/components/ui/media-image";
import { Notice } from "@/components/ui/notice";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { UI_TEXT } from "@/constants/messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import type { LibraryImage } from "@/features/media/types";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

/** The library's images to choose from (D89), newest first; Upload joins at R6.5. */
function Library({ chosen, onChoose }: { chosen: string | null; onChoose: (id: string) => void }) {
  const { data, error, isLoading, mutate } = useApiQuery<LibraryImage[]>(ADMIN_API_ROUTES.adminMedia);
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
  if (isLoading || !data) return <p aria-busy="true" className="h-40 animate-pulse rounded-panel bg-mist" />;
  if (data.length === 0) return <p className="text-ink-2">{ADMIN_TEXT.libraryEmpty}</p>;
  return (
    <ul className="grid max-h-[60dvh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
      {data.map((image) => (
        <li key={image.id}>
          <button
            type="button"
            aria-pressed={image.id === chosen}
            onClick={() => onChoose(image.id)}
            className="grid w-full gap-2 rounded-control p-2 text-start hover:bg-mist aria-pressed:bg-mist aria-pressed:ring-2 aria-pressed:ring-deep"
          >
            {/* The words under it name the button; read twice they would only repeat. */}
            <MediaImage
              image={{ ...image, alt: "" }}
              sizes="(min-width: 640px) 10rem, 45vw"
              className="aspect-[3/2] w-full rounded-control object-cover"
            />
            <span className="line-clamp-2 text-small">{image.alt || ADMIN_TEXT.decorativeImage}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * A section's photo (D89): the one chosen, with what it shows, or none;
 * Choose opens the library in a dialog, and Remove leaves the section without
 * one. A photo that has left the library says so, to be chosen again.
 */
export function PhotoField({ name, label }: { name: string; label: string }) {
  const { field, fieldState } = useController({ name });
  const value = field.value as { mediaId: string } | null;
  const { data } = useApiQuery<LibraryImage[]>(value ? ADMIN_API_ROUTES.adminMedia : null);
  const [choosing, setChoosing] = useState(false);
  const labelId = useId();
  const chosen = value ? data?.find((image) => image.id === value.mediaId) : undefined;
  return (
    <div role="group" aria-labelledby={labelId} className="grid gap-3">
      <p id={labelId} className="font-semibold">
        {label} <span className="font-normal text-ink-2">({UI_TEXT.optional})</span>
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {!value ? (
          <p className="text-ink-2">{ADMIN_TEXT.noPhoto}</p>
        ) : chosen ? (
          <figure className="grid w-48 gap-1">
            <MediaImage image={chosen} sizes="12rem" className="aspect-[3/2] w-full rounded-control object-cover" />
            <figcaption className="line-clamp-2 text-small text-ink-2">
              {chosen.alt || ADMIN_TEXT.decorativeImage}
            </figcaption>
          </figure>
        ) : data ? (
          <FieldError>{ADMIN_TEXT.photoMissing}</FieldError>
        ) : (
          <span aria-busy="true" className="aspect-[3/2] w-48 animate-pulse rounded-control bg-mist" />
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setChoosing(true)}>
            {value ? ADMIN_TEXT.changePhoto : ADMIN_TEXT.choosePhoto}
          </Button>
          {value ? (
            <Button variant="quiet" onClick={() => field.onChange(null)}>
              {ADMIN_TEXT.removePhoto}
            </Button>
          ) : null}
        </div>
      </div>
      {fieldState.error?.message ? <FieldError>{fieldState.error.message}</FieldError> : null}
      <Dialog open={choosing} onClose={() => setChoosing(false)} title={ADMIN_TEXT.choosePhoto}>
        {choosing ? (
          <Library
            chosen={value?.mediaId ?? null}
            onChoose={(id) => {
              field.onChange({ mediaId: id });
              setChoosing(false);
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
}
