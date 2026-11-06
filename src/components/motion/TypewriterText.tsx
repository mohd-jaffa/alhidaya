/** Reserved text geometry keeps the looping typewriter stable; assistive technology reads it once. */
export function TypewriterText({ text }: { text: string }) {
  return (
    <span className="typewriter relative">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(/(\s+)/).map((word, index) =>
          /^\s+$/.test(word) ? (
            word
          ) : (
            <span key={index} className="inline-block max-w-full">
              {Array.from(word).map((letter, at) => (
                <span key={at} data-type-letter className="relative">
                  {letter}
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
