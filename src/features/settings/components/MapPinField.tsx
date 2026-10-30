"use client";

import { useId, useState } from "react";
import { useController } from "react-hook-form";

import { useEditorError } from "@/components/admin/editor/EditorText";
import { Field } from "@/components/ui/field";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";

type Pin = { lat: number; lon: number } | null;

/** A number as typed; one half left empty is no number at all, for its check to say so. */
const asNumber = (typed: string) => (typed.trim() === "" ? Number.NaN : Number(typed));

/**
 * The office's spot on the static map (plan §30.6, D74): its latitude and
 * longitude as a map app gives them, both or neither; neither, and the map
 * shows the area without a pin.
 */
export function MapPinField({ name }: { name: string }) {
  const { field } = useController({ name });
  const pin = field.value as Pin;
  const [typed, setTyped] = useState({ lat: pin ? String(pin.lat) : "", lon: pin ? String(pin.lon) : "" });
  const latError = useEditorError(`${name}.lat`);
  const lonError = useEditorError(`${name}.lon`);
  const labelId = useId();

  const change = (part: "lat" | "lon", value: string) => {
    const next = { ...typed, [part]: value };
    setTyped(next);
    field.onChange(
      next.lat.trim() === "" && next.lon.trim() === "" ? null : { lat: asNumber(next.lat), lon: asNumber(next.lon) },
    );
  };

  return (
    <div role="group" aria-labelledby={labelId} className="grid gap-3">
      <div className="grid gap-1">
        <p id={labelId} className="font-semibold">
          {ADMIN_TEXT.mapPin}
        </p>
        <p className="text-small text-ink-2">{ADMIN_TEXT.mapPinHint}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={ADMIN_TEXT.latitude} error={latError} markOptional={false}>
          <TextInput inputMode="decimal" value={typed.lat} onChange={(event) => change("lat", event.target.value)} />
        </Field>
        <Field label={ADMIN_TEXT.longitude} error={lonError} markOptional={false}>
          <TextInput inputMode="decimal" value={typed.lon} onChange={(event) => change("lon", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}
