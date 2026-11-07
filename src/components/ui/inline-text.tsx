import { Fragment } from "react";

import { parseInline, type InlineRun } from "@/lib/text/inline";

/** Only React text and semantic emphasis nodes; HTML, links and other Markdown are never interpreted. */
export function InlineRuns({ runs }: { runs: InlineRun[] }) {
  return runs.map(({ text, format }, at) => {
    const content = format & 1 ? <em>{text}</em> : text;
    return format & 2 ? (
      <strong key={at} className="font-bold">
        {content}
      </strong>
    ) : (
      <Fragment key={at}>{content}</Fragment>
    );
  });
}

export function InlineText({ text }: { text: string }) {
  return <InlineRuns runs={parseInline(text)} />;
}
