import { type CSSProperties, Fragment } from "react";

/** The text's words in order, each numbered, and whether it is in the highlighted phrase. */
export function markedWords(text: string, highlight?: string | null) {
  const at = highlight ? text.indexOf(highlight) : -1;
  const segments: [string, boolean][] =
    highlight && at >= 0
      ? [
          [text.slice(0, at), false],
          [highlight, true],
          [text.slice(at + highlight.length), false],
        ]
      : [[text, false]];
  let index = 0;
  return segments.flatMap(([segment, marked]) =>
    segment
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, marked, index: index++ })),
  );
}

/**
 * Words that can rise into place from behind their own line (D128, D129):
 * each in a clipped box with its inner word numbered, so CSS or the motion
 * system can move it; the highlighted phrase in deep blue. A screen reader
 * reads the text once, whole.
 */
export function Words({ text, highlight }: { text: string; highlight?: string | null }) {
  // Relative, so the screen reader's copy is placed within the words, never off the page's edge.
  return (
    <span className="relative">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {markedWords(text, highlight).map(({ word, marked, index }) => (
          <Fragment key={index}>
            {index > 0 ? " " : null}
            <span className={marked ? "rise-word text-deep" : "rise-word"}>
              <span data-word style={{ "--i": index } as CSSProperties}>
                {word}
              </span>
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
