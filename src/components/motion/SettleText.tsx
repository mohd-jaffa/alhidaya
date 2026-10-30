import { type CSSProperties, Fragment } from "react";

interface Letter {
  letter: string;
  index: number;
}

/** The text in its pieces: words of letters (each numbered across the whole text), the spaces between, and whether a piece is marked. */
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
  const marked = segments
    .filter(([segment]) => segment)
    .map(([segment, mark]) => ({
      mark,
      words: segment
        .split(/(\s+)/)
        .map((word) => (/^\s*$/.test(word) ? word : [...word].map((letter): Letter => ({ letter, index: next++ })))),
    }));
  return { total, marked };
}

/**
 * A headline whose letters settle from wide spacing into their words as the
 * page opens (plan §30.1, D97). CSS alone draws it, so it costs no script and
 * runs before motion loads; reduced motion shows it in place. A screen reader
 * reads the words once, whole; `highlight`, words of the text as written
 * there, sits on the pale-green highlight.
 */
export function SettleText({ text, highlight }: { text: string; highlight?: string | null }) {
  const { total, marked } = pieces(text, highlight);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {marked.map(({ mark, words }, at) => {
          const content = words.map((word, w) =>
            typeof word === "string" ? (
              word
            ) : (
              <span key={w} className="inline-block whitespace-nowrap">
                {word.map(({ letter, index }) => (
                  <span
                    key={index}
                    className="settle-letter"
                    style={{ "--i": index, "--spread": ((index - total / 2) / total).toFixed(3) } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ),
          );
          return mark ? (
            <span key={at} className="box-decoration-clone rounded-[0.18em] bg-leaf-pale px-[0.1em]">
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
