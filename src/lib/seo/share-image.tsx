import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { UI_TEXT } from "@/constants/messages";

/** The size every share picture is made at (plan §19): the size Open Graph and X expect. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** The colours of the sign (plan §30.2), as the renderer needs them written out. */
const COLOURS = {
  ground: "#ffffff",
  navy: "#0b2440",
  deep: "#0f64ac",
  sky: "#33a0da",
  leaf: "#86ae3c",
  onDeep: "#ffffff",
  onDeep2: "#dce9f6",
} as const;

const SIGNS = {
  deep: { background: COLOURS.deep, title: COLOURS.onDeep, name: COLOURS.onDeep2, station: COLOURS.onDeep },
  sky: { background: COLOURS.sky, title: COLOURS.navy, name: COLOURS.navy, station: COLOURS.navy },
} as const;

const FONTS = "src/assets/fonts/atkinson-hyperlegible-next/share";

/**
 * The picture a page shows when it is shared (plan §19): its sign in its
 * line's colour, the page's headline in the site's typeface, the company's
 * name at its foot, and the three lines along the bottom edge.
 */
export async function renderShareImage({
  title,
  tone = "deep",
}: {
  title: string;
  tone?: keyof typeof SIGNS;
}): Promise<ImageResponse> {
  const [regular, bold] = await Promise.all(
    ["400", "700"].map((weight) =>
      readFile(path.join(process.cwd(), FONTS, `atkinson-hyperlegible-next-latin-${weight}-normal.woff`)),
    ),
  );
  const sign = SIGNS[tone];
  return new ImageResponse(
    <div
      style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: COLOURS.ground }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          margin: "40px 40px 0",
          padding: "64px 72px",
          borderRadius: 12,
          background: sign.background,
          fontFamily: "Atkinson Hyperlegible Next",
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: 940,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1,
            color: sign.title,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, color: sign.name }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, border: `6px solid ${sign.station}` }} />
          {UI_TEXT.siteName}
        </div>
      </div>
      <div style={{ display: "flex", height: 16, marginTop: 40 }}>
        <div style={{ flexGrow: 1, background: COLOURS.sky }} />
        <div style={{ flexGrow: 1, background: COLOURS.deep }} />
        <div style={{ flexGrow: 1, background: COLOURS.leaf }} />
      </div>
    </div>,
    {
      ...SHARE_IMAGE_SIZE,
      fonts: [
        { name: "Atkinson Hyperlegible Next", data: regular, weight: 400, style: "normal" },
        { name: "Atkinson Hyperlegible Next", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
