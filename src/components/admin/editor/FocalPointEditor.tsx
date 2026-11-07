"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { FOCAL_POINT_LIMITS } from "@/constants/limits";
import { focalPointAt } from "@/features/media/framing";
import type { FocalPoint, SiteImage } from "@/features/media/types";

/** Inline, reversible framing with a pointer target and equivalent native keyboard controls. */
export function FocalPointEditor({
  image,
  value,
  onChange,
}: {
  image: SiteImage;
  value: FocalPoint | undefined;
  onChange: (value: FocalPoint | undefined) => void;
}) {
  const id = useId();
  const point = value ?? { x: FOCAL_POINT_LIMITS.center, y: FOCAL_POINT_LIMITS.center };
  const preview = { ...image, focalPoint: value };
  return (
    <details className="w-full min-w-0 rounded-control border border-rule p-4">
      <summary className="min-h-touch cursor-pointer font-semibold text-forest">{ADMIN_TEXT.framing}</summary>
      <div className="grid min-w-0 gap-4 pt-3">
        <p id={`${id}-hint`} className="max-w-measure text-small text-ink-2">
          {ADMIN_TEXT.framingHint}
        </p>
        <button
          type="button"
          aria-label={ADMIN_TEXT.focalChoose}
          aria-describedby={`${id}-hint`}
          className="relative block w-full max-w-xl cursor-crosshair overflow-hidden rounded-control bg-mist"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const next =
              event.detail === 0
                ? { x: FOCAL_POINT_LIMITS.center, y: FOCAL_POINT_LIMITS.center }
                : focalPointAt(event.clientX, event.clientY, rect);
            if (next) onChange(next);
          }}
        >
          <MediaImage
            image={image}
            sizes="(min-width: 640px) 36rem, 100vw"
            decorative
            className="block h-auto w-full"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy ring-2 ring-ground"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          />
        </button>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {(["x", "y"] as const).map((axis) => (
            <div key={axis} className="grid min-w-0 gap-1">
              <label htmlFor={`${id}-${axis}`} className="text-small font-semibold">
                {axis === "x" ? ADMIN_TEXT.focalHorizontal : ADMIN_TEXT.focalVertical}
                {" · "}
                {ADMIN_TEXT.focalPercentage(point[axis])}
              </label>
              <input
                id={`${id}-${axis}`}
                type="range"
                dir="ltr"
                min={FOCAL_POINT_LIMITS.min}
                max={FOCAL_POINT_LIMITS.max}
                step={FOCAL_POINT_LIMITS.step}
                value={point[axis]}
                aria-valuetext={ADMIN_TEXT.focalPercentage(point[axis])}
                className="min-h-touch w-full cursor-pointer accent-forest"
                onChange={(event) => onChange({ ...point, [axis]: Number(event.target.value) })}
              />
            </div>
          ))}
        </div>
        <Button variant="quiet" className="justify-self-start" disabled={!value} onClick={() => onChange(undefined)}>
          {ADMIN_TEXT.resetFraming}
        </Button>
        <section aria-label={ADMIN_TEXT.framingPreviews} className="grid gap-3">
          <p className="text-small text-ink-2">{ADMIN_TEXT.framingPreviewHint}</p>
          <div className="grid min-w-0 grid-cols-3 items-start gap-3">
            {[
              { label: ADMIN_TEXT.framingWide, shape: "aspect-video" },
              { label: ADMIN_TEXT.framingSquare, shape: "aspect-square" },
              { label: ADMIN_TEXT.framingPortrait, shape: "aspect-[3/4]" },
            ].map(({ label, shape }) => (
              <figure key={label} className="grid min-w-0 gap-1">
                <MediaImage
                  image={preview}
                  sizes="(min-width: 640px) 12rem, 30vw"
                  decorative
                  className={`${shape} w-full rounded-control object-cover`}
                />
                <figcaption className="break-words text-small text-ink-2">{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </details>
  );
}
