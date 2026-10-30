import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { UI_TEXT } from "@/constants/messages";

/** The size every share picture is made at (plan §19): the size Open Graph and X expect. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** The redesign's colours (plan §30.2, D98), as the renderer needs them written out. */
const COLOURS = {
  ground: "#ffffff",
  navy: "#0b2440",
  forest: "#3b6b24",
  onForest: "#ffffff",
  leafPale: "#eef5e2",
} as const;

const FONT = "src/assets/fonts/inter-tight/share/inter-tight-latin-400-normal.woff";

/**
 * The picture a page shows when it is shared (plan §19, D97): on white, what
 * the page is on a pale-green pill and its headline, large and light, in the
 * site's typeface; across its foot, the company's name on the forest band,
 * as the footer carries it.
 */
export async function renderShareImage({ title, label }: { title: string; label?: string }): Promise<ImageResponse> {
  const regular = await readFile(path.join(process.cwd(), FONT));
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: COLOURS.ground,
        fontFamily: "Inter Tight",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 36,
          flexGrow: 1,
          padding: "0 80px",
        }}
      >
        {label ? (
          <div
            style={{
              display: "flex",
              padding: "10px 26px",
              borderRadius: 999,
              background: COLOURS.leafPale,
              color: COLOURS.forest,
              fontSize: 28,
            }}
          >
            {label}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            maxWidth: 1000,
            fontSize: 84,
            lineHeight: 1.04,
            letterSpacing: -3,
            color: COLOURS.navy,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 132,
          padding: "0 80px",
          background: COLOURS.forest,
          color: COLOURS.onForest,
          fontSize: 40,
          letterSpacing: -1,
        }}
      >
        {UI_TEXT.siteName}
      </div>
    </div>,
    { ...SHARE_IMAGE_SIZE, fonts: [{ name: "Inter Tight", data: regular, weight: 400, style: "normal" }] },
  );
}
