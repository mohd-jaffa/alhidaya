// Makes the favicon and the Apple touch icon from the logo's mark (plan
// R2.2), so they always match src/app/icon.svg:
//
//   npx tsx scripts/make-icons.mts
//
// Chromium (Playwright's) draws the SVG at each size; the favicon holds the
// 16, 32 and 48 px drawings in one .ico. The Apple icon sits on white, as iOS
// fills transparency with black.
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "@playwright/test";

const svg = readFileSync("src/app/icon.svg", "utf8");

async function draw(size: number, padding: number, background: string): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const inner = size - 2 * padding;
  await page.setContent(
    `<body style="margin:0;background:${background}"><div style="padding:${padding}px;width:${inner}px;height:${inner}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body>`,
  );
  const png = await page.screenshot({ omitBackground: background === "transparent", type: "png" });
  await page.close();
  return png;
}

/** An .ico holding PNG images, one directory entry each (the format browsers read). */
function ico(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}

const browser = await chromium.launch();
try {
  const favicon = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, png: await draw(size, 0, "transparent") })),
  );
  writeFileSync("src/app/favicon.ico", ico(favicon));
  writeFileSync("src/app/apple-icon.png", await draw(180, 18, "#ffffff"));
  console.log("Wrote src/app/favicon.ico (16, 32, 48 px) and src/app/apple-icon.png (180 px).");
} finally {
  await browser.close();
}
