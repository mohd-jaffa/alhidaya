import { type CSSProperties, Fragment } from "react";

import { InlineRuns } from "@/components/ui/inline-text";
import { inlineCharacters, parseInline, plainText, sliceInline } from "@/lib/text/inline";

interface Letter {
  letter: string;
  index: number;
  start: number;
  end: number;
}

/** The text in its pieces: words of letters (each numbered across the whole text), the spaces and lone punctuation between, and whether a piece is marked. */
function pieces(text: string, highlight: string | null | undefined) {
  const at = highlight ? text.indexOf(highlight) : -1;
  const segments: [string, boolean][] =
    highlight && at >= 0
      ? [
          [text.slice(0, at), false],
          [highlight, true],
          [text.slice(at + highlight.length), false],
        ]
      : [[text, false]];
  const total = text.replace(/\s/g, "").length;
  let next = 0;
  let offset = 0;
  const marked = segments
    .filter(([segment]) => segment)
    .map(([segment, mark]) => ({
      mark,
      words: segment.split(/(\s+)/).map((word) => {
        const start = offset;
        offset += word.length;
        // Standalone punctuation stays against the preceding word.
        const letters = /^\s*$|^\p{P}+$/u.test(word)
          ? null
          : inlineCharacters(word, start).map((letter): Letter => ({ ...letter, index: next++ }));
        return { start, end: offset, letters };
      }),
    }));
  return { total, marked };
}

/**
 * A headline whose letters settle from wide spacing into their words as the
 * page opens (plan §30.1, D97). CSS alone draws it, so it costs no script and
 * runs before motion loads; reduced motion shows it in place. A screen reader
 * reads the words once, whole; `highlight`, words of the text as written
 * there, sits on the pale-green highlight. Short phrases stay together;
 * longer copy can wrap within the heading, with the mark under its letters.
 */
export function SettleText({ text, highlight }: { text: string; highlight?: string | null }) {
  const runs = parseInline(text);
  const visible = plainText(text);
  const { total, marked } = pieces(visible, highlight ? plainText(highlight) : highlight);
  return (
    <>
      <span className="sr-only">{visible}</span>
      <span aria-hidden="true">
        {marked.map(({ mark, words }, at) => {
          const content = words.map(({ start, end, letters }, w) =>
            letters === null ? (
              <Fragment key={w}>
                <InlineRuns runs={sliceInline(runs, start, end)} />
              </Fragment>
            ) : (
              <span
                key={w}
                className={`inline-block max-w-full${sliceInline(runs, start, end).some((run) => run.format & 1) ? " pe-(--spacing-emphasis-ink)" : ""}`}
              >
                {letters.map(({ index, start, end }) => (
                  <span
                    key={index}
                    className="settle-letter"
                    style={{ "--i": index, "--spread": ((index - total / 2) / total).toFixed(3) } as CSSProperties}
                  >
                    <InlineRuns runs={sliceInline(runs, start, end)} />
                  </span>
                ))}
              </span>
            ),
          );
          return mark ? (
            <span
              key={at}
              className="inline-block max-w-full box-decoration-clone rounded-highlight bg-leaf-pale px-[0.1em]"
            >
              {content}
            </span>
          ) : (
            <Fragment key={at}>{content}</Fragment>
          );
        })}
      </span>
    </>
  );
}
