import { type CSSProperties, Fragment } from "react";

/**
 * The text's words in order, each numbered, whether it is in the highlighted
 * phrase, and whether a space comes before it (none before a comma that
 * follows the phrase).
 */
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
  let spaced = false;
  return segments.flatMap(([segment, marked]) =>
    [...segment.matchAll(/(\s*)(\S+)(\s*)/g)].map(([, before, word, after]) => {
      const spaceBefore = index > 0 && (spaced || before !== "");
      spaced = after !== "";
      return { word, marked, index: index++, spaceBefore };
    }),
  );
}

/**
 * Words that can rise into place from behind their own line (D128, D129):
 * each in a clipped box with its inner word numbered, so CSS or the motion
 * system can move it; the highlighted phrase in deep blue. Words with no
 * space between them (a comma after the phrase) never part at a line's end.
 * A screen reader reads the text once, whole.
 */
export function Words({ text, highlight }: { text: string; highlight?: string | null }) {
  const runs: ReturnType<typeof markedWords>[] = [];
  for (const word of markedWords(text, highlight)) {
    if (word.spaceBefore || runs.length === 0) runs.push([word]);
    else runs[runs.length - 1].push(word);
  }
  // Relative, so the screen reader's copy is placed within the words, never off the page's edge.
  return (
    <span className="relative">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {runs.map((run, at) => {
          const boxes = run.map(({ word, marked, index }) => (
            <span key={index} className={marked ? "rise-word text-deep" : "rise-word"}>
              <span data-word style={{ "--i": index } as CSSProperties}>
                {word}
              </span>
            </span>
          ));
          return (
            <Fragment key={run[0].index}>
              {at > 0 ? " " : null}
              {run.length > 1 ? <span className="inline-block max-w-full">{boxes}</span> : boxes}
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
