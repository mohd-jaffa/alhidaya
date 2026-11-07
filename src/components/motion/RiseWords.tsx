import { Words } from "./Words";
import { RiseWordsMotion } from "./RiseWordsMotion";

/** Parse and draw copy on the server; the client receives only its existing motion wrapper. */
export function RiseWords({ text, highlight }: { text: string; highlight?: string | null }) {
  return (
    <RiseWordsMotion>
      <Words text={text} highlight={highlight} />
    </RiseWordsMotion>
  );
}
