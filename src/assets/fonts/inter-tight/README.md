# Inter Tight

The site's typeface (plan D108, Phase 6B), chosen by the user for the
redesign: a grotesk close to the reference's (D97).

- **File:** `inter-tight-latin-wght-normal.woff2`, the variable font
  (weight 100 – 900), roman only, Latin subset (U+0000 – 00FF, general
  punctuation, €, ™), 44 KB.
- **From:** `@fontsource-variable/inter-tight` 5.3.0 on npm (tarball
  SHA-256 `f41e72c42c25f57032c2a0e76c72659df67fe92f88d6850629c77bcd9e199124`),
  built from <https://github.com/rsms/inter-tight>.
- **Licence:** SIL Open Font License 1.1 (`OFL.txt`), by The Inter Project
  Authors.
- **Loaded by** `next/font/local` in `src/app/layout.tsx`: served from the
  site itself, preloaded, with a metric-matched Arial fallback so text does
  not shift when it arrives (plan §22.4).

Letters outside the subset (Latin Extended, in some names) fall back to the
matched Arial. The Arabic companion is added here when Arabic arrives (plan
§33).

## For share images

`share/` holds the regular (400) and bold (700) weights as WOFF, Latin
subset, 28 KB each, for the pictures a page shows when it is shared (plan
§19): the image renderer reads WOFF but not WOFF2. They are never sent to a
visitor's browser.

- **From:** `@fontsource/inter-tight` 5.3.0 on npm (tarball SHA-256
  `827a0047a91fceff9f13dda2e7ffa4cbf20d4487179923ce6e2008ee81c207ef`), same
  licence.
