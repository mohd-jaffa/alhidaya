# Atkinson Hyperlegible Next

The site's typeface (plan D61, R2.1), chosen by the user from the specimen.

- **File:** `atkinson-hyperlegible-next-latin-wght-normal.woff2`, the variable
  font (weight 200 – 800), roman only, Latin subset (U+0000 – 00FF, general
  punctuation, €, ™), 34 KB.
- **From:** `@fontsource-variable/atkinson-hyperlegible-next` 5.3.0 on npm
  (tarball SHA-256 `75d5156505841b7dd4251398f0a5ff9e44120c87c2e388e9a108879b4def23a6`),
  built from <https://github.com/googlefonts/atkinson-hyperlegible-next>.
- **Licence:** SIL Open Font License 1.1 (`OFL.txt`), by the Atkinson
  Hyperlegible Next Project Authors (Braille Institute of America).
- **Loaded by** `next/font/local` in `src/app/layout.tsx`: served from the
  site itself, preloaded, with a metric-matched Arial fallback so text does
  not shift when it arrives (plan §22.4).

Letters outside the subset (Latin Extended, in some names) fall back to the
matched Arial. The Arabic companion, Noto Sans Arabic, is added here when
Arabic arrives (plan §33).

## For share images

`share/` holds the regular (400) and bold (700) weights as WOFF, Latin
subset, 15 KB each, for the pictures a page shows when it is shared (plan
§19): the image renderer reads WOFF but not WOFF2. They are never sent to a
visitor's browser.

- **From:** `@fontsource/atkinson-hyperlegible-next` 5.3.0 on npm (tarball
  SHA-256 `33dcb7d0d4e2ea98a96985ca7448f738c3b5b370cfc5230b1e40e4f728920cc2`), same licence.
