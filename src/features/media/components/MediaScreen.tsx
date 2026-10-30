"use client";

import { useState } from "react";

import { ImageUpload } from "@/components/admin/editor/ImageUpload";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { MediaImage } from "@/components/ui/media-image";
import { Notice } from "@/components/ui/notice";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";
import { errorMessage } from "@/lib/errors/errorMessage";
import { useApiQuery } from "@/lib/query/useApiQuery";

import type { LibraryImageItem } from "../types";
import { ImageDetails } from "./ImageDetails";

/** Whether an image answers a search: by what it shows, or where it came from. */
const matches = (image: LibraryImageItem, search: string) =>
  [image.alt, image.source?.provider ?? "", image.source?.licence ?? ""].some((words) =>
    words.toLowerCase().includes(search.trim().toLowerCase()),
  );

/**
 * Media (plan §15, §16, D93): the library's images, newest first, each
 * saying what it shows and where it is used, found by a search; Upload an
 * image; and each opened in a dialog to change its words or delete it.
 */
export function MediaScreen() {
  const { data, error, isLoading, mutate } = useApiQuery<LibraryImageItem[]>(ADMIN_API_ROUTES.adminMedia);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const shown = data?.filter((image) => matches(image, search)) ?? [];
  const opened = data?.find((image) => image.id === openId);

  return (
    <div className="grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-section font-bold">{ADMIN_TEXT.media}</h1>
          <p className="max-w-prose text-ink-2">{ADMIN_TEXT.mediaIntro}</p>
        </div>
        <Button
          variant="secondary"
          pictogram="upload"
          onClick={() => {
            setUploaded(false);
            setUploading(true);
          }}
        >
          {ADMIN_TEXT.uploadImage}
        </Button>
      </div>
      {uploaded ? <Notice tone="success" title={ADMIN_TEXT.uploaded} /> : null}
      {error ? (
        <Notice tone="error" title={ADMIN_TEXT.loadFailed}>
          <p>{errorMessage(error)}</p>
          <Button variant="secondary" onClick={() => mutate()} className="mt-3">
            {ADMIN_TEXT.tryAgain}
          </Button>
        </Notice>
      ) : isLoading || !data ? (
        <div aria-busy="true" aria-label={ADMIN_TEXT.loading} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((placeholder) => (
            <div key={placeholder} className="aspect-[3/2] animate-pulse rounded-panel bg-mist" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-ink-2">{ADMIN_TEXT.noImages}</p>
      ) : (
        <>
          <div className="max-w-sm">
            <Field label={ADMIN_TEXT.searchImages} hint={ADMIN_TEXT.searchImagesHint} markOptional={false}>
              <TextInput type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Field>
          </div>
          {shown.length === 0 ? (
            <p className="text-ink-2">{ADMIN_TEXT.noMatches}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((image) => (
                <li key={image.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(image.id)}
                    className="grid w-full gap-2 rounded-panel p-2 text-start hover:bg-mist"
                  >
                    {/* The words under it name the button; read twice they would only repeat. */}
                    <MediaImage
                      image={{ ...image, alt: "" }}
                      sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw"
                      className="aspect-[3/2] w-full rounded-control bg-mist object-cover"
                    />
                    <span className="line-clamp-2 text-small font-semibold">
                      {image.alt || ADMIN_TEXT.decorativeImage}
                    </span>
                    <span className="text-small text-ink-2">{ADMIN_TEXT.usedCount(image.usedIn.length)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Dialog open={uploading} onClose={() => setUploading(false)} title={ADMIN_TEXT.uploadImage}>
        {uploading ? (
          <ImageUpload
            onUploaded={() => {
              setUploading(false);
              setUploaded(true);
            }}
          />
        ) : null}
      </Dialog>
      <Dialog
        open={opened !== undefined}
        onClose={() => setOpenId(null)}
        title={opened?.alt || ADMIN_TEXT.imageDetails}
      >
        {opened ? <ImageDetails key={opened.id} image={opened} onDeleted={() => setOpenId(null)} /> : null}
      </Dialog>
    </div>
  );
}
