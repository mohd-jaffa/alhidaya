# D188 — Lightweight inline copy formatting, 2026-11-07

Complete locally and uncommitted for review. Existing public website copy supports `**bold**`, `*italic*` and `***both***`; backslash-escaped asterisks and unmatched delimiters stay readable literal text. No full Markdown library, HTML interpretation, toolbar, dependency, upload type or database migration was added.

## Behavior

- Safe React strong/em nodes format section titles and descriptions, rich-text blocks, points, service/job copy, action labels and editable navigation/footer copy. Existing bold weight and public semantic font roles apply.
- Animated words, settling letters, highlighted phrases and Contact's typewriter preserve the styles while animating only visible characters. Public accessible heading names contain the visible words once, without syntax markers.
- Search/share metadata, share pictures, structured data, image labels, public service choices, generated slugs and submission snapshots use clean plain-text projections. Routing, phone/email/address/password values remain literal. Existing raw string limits include formatting characters.
- Pages, Services, Jobs and Settings show one concise syntax hint per editor. Save draft → private Preview → Publish/Discard uses the existing validation, authentication, transaction/audit and cache-invalidation paths. Raw strings remain editable, and visitor copy stays published-only.
- RiseWords draws its text on the server and passes rendered word slots into the existing client motion wrapper, keeping the parser out of that heading's client path. Navigation uses the same small safe renderer. Initial JavaScript stays within the existing public limit.

## Confirmed fixes during verification

React's compiler check caught mutable render-callback position counters. Pure Unicode range preparation replaced them. Formatted italic word masks and the typewriter reserve ink/caret room; this fixes the measured 320 px / 200% Source Sans 3 heading overflow without changing unformatted copy's spacing.

The first new browser tests used an exact name for an optional field and expected a discarded page section to remain expanded. Both test assumptions were corrected against the actual editor workflow; saved formatting and published data were retained. The isolated media root was populated consistently with the test database's media records. No assertion or budget was relaxed.

ESLint now skips the already Git-ignored `.data/` runtime area, which contained a copied generated standalone build for the admin walkthrough. Source, tests and configuration remain linted; private/runtime artifacts were neither edited nor added to Git.

## Final validation

| Gate | Result |
|---|---|
| Unit, DB-contract and isolated local-MySQL coverage | 1,359 tests in 369 files passed; statements, branches, functions and lines all 100% |
| Complete production E2E | 270 passed, 62 intentional duplicate-project skips, zero failures (10.4 minutes) |
| New formatting workflows | Six phone/desktop journeys passed; private draft/preview/publish/discard, HTML escaping, clean metadata/dropdowns and styled sections/navigation |
| Styled font/layout matrix | 240 About/Contact states: 15 fonts × 4 widths (320/390/768/1440) × normal/doubled text × 2 templates; no page overflow or clipped measured headings/paragraphs |
| Development hydration | Two cases / 46 navigations passed using formatted test seed copy; no hydration mismatch or uncaught error |
| Production performance | All 40 serial cases passed across 20 routes, unchanged budgets and no retries (9.0 minutes) |
| Static/design checks | Lint, formatting, Next/TypeScript, standalone build and diff checks passed; Impeccable scan of 43 changed UI files: no primary findings |

Build `gLhbjogm1XoQ77FAgEygi`: maximum initial JavaScript 173,771 / 174,080 gzip bytes, LCP 688.4 ms, scripted INP upper bound 64 ms, combined CLS 0.0419191, lowest Lighthouse category 96, no observed scrolling long task at the observer threshold and 0% desktop missed-vsync estimate. All expected public route statuses and the deliberate 404 passed.

Evidence: [validation summary](2026-11-07-inline-formatting-validation.json), [all-route performance](2026-11-07-inline-formatting-performance.json), [design detector](2026-11-07-inline-formatting-detector.json), [Home heading](2026-11-07-inline-formatting-home-phone.png), [About phone](2026-11-07-inline-formatting-about-phone.png), [Contact at 320 px / doubled text](2026-11-07-inline-formatting-contact-320-enlarged.png). These renders were visually reviewed. Detailed local logs remain under `/private/tmp/alhidaya-inline-*.log`; browser/Lighthouse artifacts remain in ignored `test-results/`.

## Boundaries

Validation used Chromium, emulated layouts and synthesized touch; physical Safari/Firefox/device, manual screen-reader, field and production-region checks retain their existing release status. No actual review content or private draft was edited by tests. Test writes stayed in the separate local database and temporary upload folders. The verified build was copied to an isolated local preview on port 3210; the expired temporary tunnel was replaced. No commit, push, deployment or client-server change was performed.
