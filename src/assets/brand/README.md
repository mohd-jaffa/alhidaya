# The Al Hidaya logo

Redrawn as SVG from the only source the client has, the JPG
`docs/brand/al-hidaya-logo-original.jpg` (2480 × 441 px), for the client to
approve (plan D62, R2.2, R7.5).

| File | What |
|---|---|
| `logo.svg` | The full logo: the mark, *Al Hidaya Health Care Service WLL*, and the Arabic line |
| `logo-mark.svg` | The mark alone |
| `logo-mark-white.svg` | The mark alone in plain white, for a faint watermark on deep blue (the phone menu, D167) |
| `src/app/icon.svg` | The mark, centred in a square: the browser's icon |
| `src/app/favicon.ico`, `src/app/apple-icon.png` | Drawn from `icon.svg` by `npx tsx scripts/make-icons.mts` |

## How it was redrawn (2026-10-29)

- **Measured, then drawn exactly:** the two crosses (plus shapes, each bar
  0.41 of the cross's width; the large one 102.2 units across, the small one
  61.4) and the head (a circle, radius 33.16), from their sub-pixel edges in
  the JPG.
- **Traced:** the swoosh, the leaves (with their white veins) and both lines
  of lettering, each separated from the JPG by colour, smoothed, traced at
  4× with potrace, and compared with the original at 3× enlargement. The
  lettering is traced rather than retyped, so it keeps the logo's own letters.
- **Colours sampled from the logo**, not the site's tokens: the swoosh
  `#1262A9` → `#2175B9` → `#2D8DCA` (left to right); the large cross
  `#2072B6` → `#3194CF` (lower left to upper right); the small cross
  `#3AA5DD`; the head `#448ECB`; the leaves `#76AA40` → `#8DB43D` →
  `#B9CC34`; the English line `#37A4DC`; the Arabic line `#86B43F`.
- Known difference: the hairline tip at the top of the swoosh ends a few
  units sooner than in the JPG, where it fades into JPEG noise.

The site names the company as the logo does (D121): *Al Hidaya Health Care
Service*, and *Al Hidaya Health Care Service W.L.L.* in the footer's
copyright.
