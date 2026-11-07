import { InlineRuns } from "@/components/ui/inline-text";
import { inlineCharacters, parseInline, plainText, sliceInline } from "@/lib/text/inline";

/** Reserved text geometry keeps the looping typewriter stable; assistive technology reads it once. */
export function TypewriterText({ text }: { text: string }) {
  const runs = parseInline(text);
  const visible = plainText(text);
  return (
    <span className="typewriter relative" data-inline-emphasis={runs.some((run) => run.format !== 0) || undefined}>
      <span className="sr-only">{visible}</span>
      <span aria-hidden="true">
        {Array.from(visible.matchAll(/\s+|\S+/g)).map(({ 0: word, index: start }, index) =>
          /^\s+$/.test(word) ? (
            <span key={index}>
              <InlineRuns runs={sliceInline(runs, start, start + word.length)} />
            </span>
          ) : (
            <span key={index} className="typewriter-word inline-block max-w-full">
              {inlineCharacters(word, start).map(({ start, end }, at) => (
                <span key={at} data-type-letter className="relative">
                  <InlineRuns runs={sliceInline(runs, start, end)} />
                  <span data-type-caret aria-hidden="true" />
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
