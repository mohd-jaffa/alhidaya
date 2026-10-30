"use client";

import { ListItems } from "./RichTextField";

/** A list of short lines that may be empty (plan §8, §9.1): what's included, responsibilities, qualifications. */
export function PointsField({
  name,
  label,
  item,
  max,
  hideLabel = false,
}: {
  name: string;
  label: string;
  /** What one line is called, numbered. */
  item: string;
  max: number;
  /** When the group around it already says it, its name is kept for screen readers alone. */
  hideLabel?: boolean;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className={hideLabel ? "sr-only" : "mb-1 font-semibold"}>{label}</legend>
      <ListItems name={name} item={item} min={0} max={max} />
    </fieldset>
  );
}
