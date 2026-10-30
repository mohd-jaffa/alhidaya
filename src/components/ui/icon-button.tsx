import type { PictogramName } from "@/assets/brand/pictograms";

import { Pictogram } from "./pictogram";

/**
 * An action drawn as a pictogram alone (R6.3), the admin's alone, so the public
 * pages never carry it: a 44 px target with its words
 * for screen readers. `unavailable` keeps it in place and focusable, saying
 * so, rather than disabled, so focus is never lost when it stops applying
 * (an item moved to the top can no longer move up).
 */
export function IconButton({
  label,
  pictogram,
  unavailable = false,
  onClick,
}: {
  label: string;
  pictogram: PictogramName;
  unavailable?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={unavailable || undefined}
      onClick={unavailable ? undefined : onClick}
      className="grid size-touch shrink-0 place-items-center rounded-control text-deep hover:bg-sky/15 aria-disabled:cursor-not-allowed aria-disabled:text-ink-2/50 aria-disabled:hover:bg-transparent"
    >
      <Pictogram name={pictogram} size="sm" />
    </button>
  );
}
