import { plainText } from "@/lib/text/inline";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { UI_TEXT } from "@/constants/messages";
import { SITE } from "@/constants/site";

/** The size every share picture is made at (plan §19): the size Open Graph and X expect. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Theme 6 tokens (DESIGN.md), written out for the server image renderer. */
const COLOURS = {
  ground: "#ffffff",
  navy: "#0b2440",
  deep: "#0f64ac",
  leaf: "#86ae3c",
  leafPale: "#eef5e2",
} as const;

const FONT = "src/assets/fonts/inter-tight/share/inter-tight-latin-400-normal.woff";

/**
 * A self-contained, branded share card (plan §19): the original logo, the
 * published headline and the site's domain. No remote images or browser JS.
 */
export async function renderShareImage({ title, label }: { title: string; label?: string }): Promise<ImageResponse> {
  title = plainText(title);
  label = label ? plainText(label) : label;
  const [regular, logo] = await Promise.all([
    readFile(path.join(process.cwd(), FONT)),
    readFile(path.join(process.cwd(), "src/assets/brand/logo.svg")),
  ]);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: COLOURS.ground,
        fontFamily: "Inter Tight",
        padding: "56px 72px 48px",
        position: "relative",
      }}
    >
      {/* The image renderer needs an embedded original, not a browser image loader. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;base64,${logo.toString("base64")}`}
        width={480}
        height={73}
        alt={UI_TEXT.siteName}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 20,
          flexGrow: 1,
          padding: "28px 0",
        }}
      >
        {label ? (
          <div
            style={{
              display: "flex",
              padding: "8px 18px",
              borderRadius: 12,
              background: COLOURS.leafPale,
              color: COLOURS.navy,
              fontSize: 24,
            }}
          >
            {label}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            maxWidth: 1056,
            fontSize: Math.max(44, Math.min(72, 600 / Math.sqrt(Math.max(1, title.length)))),
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: COLOURS.deep,
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: COLOURS.navy,
          fontSize: 26,
        }}
      >
        {SITE.domain}
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 14 }}>
        <div style={{ width: "72%", background: COLOURS.deep }} />
        <div style={{ flexGrow: 1, background: COLOURS.leaf }} />
      </div>
    </div>,
    { ...SHARE_IMAGE_SIZE, fonts: [{ name: "Inter Tight", data: regular, weight: 400, style: "normal" }] },
  );
}
