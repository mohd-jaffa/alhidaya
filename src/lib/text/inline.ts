/** Limited inline emphasis, never HTML or full Markdown. Work is linear in the input length. */
export interface InlineRun {
  text: string;
  /** Italic = 1, bold = 2, both = 3. */
  format: number;
}

export function parseInline(text: string): InlineRun[] {
  if (!/[*\\]/.test(text)) return [{ text, format: 0 }];
  const tokens = Array.from(text.matchAll(/\\([*\\])|\*+|[^*\\]+|\\/g));
  const stack: number[] = [];
  const pairs = new Map<number, number>();
  tokens.forEach((token, at) => {
    const marker = token[0];
    if (token[1] || marker[0] !== "*" || marker.length > 3) return;
    const before = text[token.index - 1];
    const after = text[token.index + marker.length];
    const previous = stack.at(-1);
    if (before && !/\s/.test(before) && previous !== undefined && tokens[previous][0] === marker) {
      stack.pop();
      pairs.set(previous, at);
      pairs.set(at, previous);
    } else if (after && !/\s/.test(after)) stack.push(at);
  });
  const runs: InlineRun[] = [];
  const formats = [0];
  tokens.forEach((token, at) => {
    const pair = pairs.get(at);
    if (pair !== undefined) {
      if (pair > at) formats.push(formats.at(-1)! | token[0].length);
      else formats.pop();
      return;
    }
    const value = token[1] ?? token[0];
    const format = formats.at(-1)!;
    const last = runs.at(-1);
    if (last?.format === format) last.text += value;
    else runs.push({ text: value, format });
  });
  return runs;
}

/** Clean display words for attributes, search/share data, selects and snapshots; leaves unmatched syntax literal. */
export function plainText(text: string): string {
  return parseInline(text)
    .map((run) => run.text)
    .join("");
}

/** Preserve emphasis while animated words/letters and highlighted phrases split the visible text. */
export function sliceInline(runs: InlineRun[], start: number, end: number): InlineRun[] {
  let offset = 0;
  return runs.flatMap((run) => {
    const text = run.text.slice(Math.max(0, start - offset), Math.max(0, end - offset));
    offset += run.text.length;
    return text ? [{ ...run, text }] : [];
  });
}

/** UTF-16 ranges for each visible code point, prepared before a letter animation renders. */
export function inlineCharacters(text: string, start = 0) {
  let offset = start;
  return Array.from(text, (letter) => {
    const start = offset;
    offset += letter.length;
    return { letter, start, end: offset };
  });
}
