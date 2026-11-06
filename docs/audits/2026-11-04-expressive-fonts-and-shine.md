# Expressive fonts and footer shine — D169 / D170

Date: 2026-11-04. Local production build: `luTUt4WwXV9ddjF9MfVBk`. No staging, commit, push, deployment or client-server action.

## Changes

Font Manager retains its original ten families and adds Playfair Display, Cormorant Garamond, Fraunces, Space Grotesk and Syne. The five choices are agent defaults documented for review in D169/Q55. All fifteen are selectable for each of the existing twenty public text roles. Current drafts, published choices and Inter Tight defaults are preserved. No font upload, new dependency, migration or additional design control.

Each added Latin variable WOFF2 is self-hosted with its upstream SIL Open Font License. Version, source tarball, bytes and SHA-256 are recorded in `src/assets/fonts/library.json`. The deployable license bundle includes all fifteen licenses. Optional faces are not preloaded. Serif families use Next's metric-adjusted Times New Roman fallback; sans faces use Arial.

The stationary footer logo retains its 4.5-second diagonal sweep and 0.4-second initial lead-in. Its recurring quiet gap is halved from 5.5 to 2.75 seconds, yielding a 7.25-second cycle. Existing opacity phases preserve their elapsed times; only transform and opacity animate. The highlight remains hidden for reduced motion. Existing footer content and nurse artwork are preserved.

## Verification

- Full unit, database-contract and local-MySQL integration suite: **1,299 tests across 364 files passed**, with **100% statements (4,868), branches (3,113), functions (1,798) and lines (4,324)**.
- Built-app targeted E2E: **7 passed, 3 duplicate phone-matrix skips**. Phone and desktop workflows select Playfair Display, save, privately preview, publish independently, select Syne, save and discard; the admin's own font remains fixed. Axe passes for the editor and mixed-role page.
- **900 layout cases:** ten public templates × six widths (320, 390, 414, 768, 1024, 1440 px) × fifteen fonts. No document overflow or clipped headings; visible form input text remains at least 16 px. Every family loads at 400/500/600/700. Thirty additional phone-menu cases check all fifteen at 320/414 px.
- Twenty mixed semantic-role assignments retain the selected family, including captions, detail text, labels, legends, H4, ordinary links, action links and errors.
- Fifteen cold browser contexts with font responses delayed 250 ms: maximum observed CLS **0.005308**, below the 0.05 budget. One font file requested for the default, two for each optional case (selected face plus retained base preload); no unused optional faces requested.
- Phone and desktop shine checks sample the current and next cycle, assert 7.25-second duration, the preserved 4.5-second sweep and 2.75-second quiet gap, stationary logo bounds/transform, decorative semantics and static reduced-motion behavior.
- Lint, formatting, typecheck, production build and scoped Impeccable typography detector passed. The detector reported zero findings. Reviewed the real bundled font specimens and phone/desktop editor screenshots: the five additions have distinct serif/geometric/display character and fit the existing editor.

## Performance

Home passed its mobile lab performance gates (Fast 4G / 4× CPU): LCP **555.51 ms**, CLS **0**, scripted INP bound **64 ms**, no observed scrolling long task, all Lighthouse categories **100**. Initial JavaScript is **173,059 / 174,080 gzip bytes**. See `2026-11-04-expressive-fonts-performance.json`. This is a Home-only follow-up; previous wider route measurements are not claimed as rerun here.

## Evidence and limits

- `2026-11-04-expressive-font-specimens.png`: controlled comparison using the app's actual bundled font faces; a QA specimen, not a new app screen.
- `2026-11-04-expressive-font-layout-matrix.json`: 900 layout observations.
- `2026-11-04-expressive-cold-font-loading.json`: fifteen delayed-load observations.
- `2026-11-04-font-manager-phone.png` and `2026-11-04-font-manager-desktop.png`: refreshed editor screenshots.

This pass verifies emulated Chromium viewports and the existing content. It does not certify physical devices, every browser or every future text entry. No new known feature defect remains within the tested scope. Existing published font choices remain untouched in the development database; tests change and restore only the isolated local test database.
