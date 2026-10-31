import type { CSSProperties, ReactNode } from "react";

import { PauseToggle } from "@/components/ui/pause-toggle";

/** At least this many items in each half of the loop, so a wide screen never sees its end. */
const PER_HALF = 8;

/**
 * A row that runs on its own in an endless loop (D124), by CSS alone, so it
 * adds no script: its items repeated until each half of the track is wide
 * enough, the track moved by half its width, so no seam shows. Only the first
 * copy is read and reached; the repeats are hidden from screen readers and
 * from the keyboard. It stops while the pointer is on it or anything in it has
 * focus, and its round pause button stops it (WCAG 2.2.2). With motion reduced
 * it stands still, its items wrapped in rows.
 */
export function LoopRow({
  as: List = "ul",
  items,
  secondsPerItem,
  pauseLabel,
  footer,
  className,
  viewClassName,
  listClassName,
  barClassName,
}: {
  /** What the row is: a list of steps in order, or of things. */
  as?: "ol" | "ul";
  items: ReactNode[];
  /** How long each item takes to pass: slow enough to read. */
  secondsPerItem: number;
  pauseLabel: string;
  /** Beside the pause button, under the row: a way onward. */
  footer?: ReactNode;
  className?: string;
  viewClassName?: string;
  listClassName?: string;
  /** The bar under the row, holding the way onward and the pause button. */
  barClassName?: string;
}) {
  const bar = ["flex items-center justify-between gap-4", barClassName].filter(Boolean).join(" ");
  // With nothing to run, only the way onward stays.
  if (items.length === 0) return footer ? <div className={bar}>{footer}</div> : null;
  const repeats = Math.ceil(PER_HALF / items.length);
  const style = { "--loop-duration": `${items.length * repeats * secondsPerItem}s` } as CSSProperties;
  return (
    <div className={["loop-band grid gap-5", className].filter(Boolean).join(" ")} style={style}>
      <div
        className={[
          "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:[mask-image:none]",
          viewClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="loop-track flex w-max motion-reduce:w-auto">
          {Array.from({ length: repeats * 2 }, (_, copy) => (
            <List
              key={copy}
              aria-hidden={copy > 0 || undefined}
              inert={copy > 0 || undefined}
              className={["flex shrink-0 pe-4 motion-reduce:flex-wrap", copy > 0 ? "loop-copy" : null, listClassName]
                .filter(Boolean)
                .join(" ")}
            >
              {items}
            </List>
          ))}
        </div>
      </div>
      <div className={bar}>
        {footer ?? <span />}
        <PauseToggle label={pauseLabel} tone="ground" />
      </div>
    </div>
  );
}
