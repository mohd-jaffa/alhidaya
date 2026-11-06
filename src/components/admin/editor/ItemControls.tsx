"use client";

import { IconButton } from "@/components/ui/icon-button";
import { ADMIN_TEXT } from "@/constants/admin-messages";

/**
 * Move up, Move down and Remove for one item of a list (D90): a section, a
 * block of text, a value, a list's line; without `onRemove`, only the moves
 * (the services' order). Each names what it acts on; one that no longer
 * applies stays in place, saying so.
 */
export function ItemControls({
  thing,
  index,
  count,
  first = 0,
  canRemove = true,
  onMove,
  onRemove,
}: {
  thing: string;
  index: number;
  count: number;
  /** The highest place an item may move to: a page's sign keeps the first. */
  first?: number;
  canRemove?: boolean;
  onMove: (to: number) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex min-w-0 max-w-full flex-wrap">
      <IconButton
        label={ADMIN_TEXT.actionOn(ADMIN_TEXT.moveUp, thing)}
        pictogram="chevronUp"
        unavailable={index <= first}
        onClick={() => onMove(index - 1)}
      />
      <IconButton
        label={ADMIN_TEXT.actionOn(ADMIN_TEXT.moveDown, thing)}
        pictogram="chevronDown"
        unavailable={index >= count - 1}
        onClick={() => onMove(index + 1)}
      />
      {onRemove ? (
        <IconButton
          label={ADMIN_TEXT.actionOn(ADMIN_TEXT.remove, thing)}
          pictogram="close"
          unavailable={!canRemove}
          onClick={onRemove}
        />
      ) : null}
    </div>
  );
}
